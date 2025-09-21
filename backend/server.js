// server.js

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import userModel from './models/user.model.js';
import { generateStreamingResponse } from './services/ai.service.js';

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let aiUserId;
userModel.findOrCreateAIUser().then(aiUser => {
    aiUserId = aiUser._id;
    console.log(`AI User is ready with ID: ${aiUserId}`);
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        const projectId = socket.handshake.query?.projectId;
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) { return next(new Error('Invalid or missing projectId')); }
        const project = await projectModel.findById(projectId);
        if (!project) { return next(new Error('Project not found')); }
        if (!token) { return next(new Error('Authentication error: Token not provided')); }
        socket.project = project;
        next();
    } catch (error) {
        console.error("Socket middleware error:", error.message);
        next(new Error("Authentication failed"));
    }
});

io.on('connection', socket => {
    if (!socket.project) {
        socket.disconnect();
        return;
    }

    const roomId = socket.project._id.toString();
    socket.join(roomId);
    console.log(`A user connected to project room: ${roomId}`);

    socket.on('project-message', async (data) => {
        try {
            const { Message, sender, projectId, fileTree } = data;
            if (!Message || !sender || !projectId) { return; }

            const AiIsPresentInMessage = Message.toLowerCase().includes('@');
            
            const userMessageToSave = { Message, sender: sender._id };
            let updatedProject = await projectModel.findByIdAndUpdate(projectId, {
                $push: { messages: userMessageToSave }
            }, { new: true });
            
            const savedMessage = updatedProject.messages[updatedProject.messages.length - 1];
            
            const populatedUserMessage = { ...savedMessage.toObject(), sender };
            io.to(roomId).emit('project-message', populatedUserMessage);

            if (AiIsPresentInMessage) {
                const aiMessageId = new mongoose.Types.ObjectId();
                
                const aiPlaceholder = { 
                    _id: aiMessageId, Message: '', sender: aiUserId, isAIMessage: true,
                };
                updatedProject = await projectModel.findByIdAndUpdate(projectId, {
                    $push: { messages: aiPlaceholder }
                }, { new: true });
                const savedPlaceholder = updatedProject.messages.find(m => m._id.equals(aiMessageId));

                io.to(roomId).emit('project-message', {
                    ...savedPlaceholder.toObject(),
                    sender: { email: 'AI Assistant', isAI: true, _id: aiUserId },
                    isLoading: true
                });

                try {
                    const userPrompt = Message.replace(/@/gi, '').trim();
                    let finalAiResponseText = '';
                    
                    const fullResponse = await generateStreamingResponse(userPrompt, fileTree, (chunk) => {
                        finalAiResponseText += chunk;
                        io.to(roomId).emit('ai-message-chunk', { _id: savedPlaceholder._id, chunk });
                    });
                    
                    let responseToSaveInChat = finalAiResponseText;
                    
                    try {
                        const parsedResponse = JSON.parse(fullResponse);
                        if (parsedResponse && parsedResponse.fileTree) {
                            responseToSaveInChat = parsedResponse.text || "I've updated the files for you.";
                        }
                    } catch (e) { /* Is conversational text */ }
                    
                    await projectModel.updateOne(
                        { "messages._id": savedPlaceholder._id },
                        { "$set": { "messages.$.Message": responseToSaveInChat } }
                    );
                    
                    io.to(roomId).emit('ai-message-end', { _id: savedPlaceholder._id, timestamp: new Date() });

                } catch (error) {
                    console.error("Error in AI Stream:", error);
                    io.to(roomId).emit('ai-message-error', { _id: savedPlaceholder._id, Message: "⚠️ AI Error." });
                }
            }
        } catch (error) {
            console.error("Error handling project message:", error);
        }
    });

    socket.on('update-files', async ({ projectId, fileTree }) => {
        try {
            const fileTreeString = JSON.stringify(fileTree);
            await projectModel.findByIdAndUpdate(projectId, { $set: { fileTree: fileTreeString } });
            socket.to(roomId).emit('files-updated', fileTree);
        } catch (error) {
            console.error("Error updating files:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected from project room: ${roomId}`);
    });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});