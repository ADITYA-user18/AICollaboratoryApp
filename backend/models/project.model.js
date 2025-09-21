// models/project.model.js

import mongoose from "mongoose";

// The messageSchema remains unchanged
const messageSchema = new mongoose.Schema({
    Message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAIMessage: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: [true, 'project name must be unique'],
        lowercase: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    messages: [messageSchema],

    // ✅ FIX: Changed from Map to String to store the fileTree as JSON text.
    fileTree: {
        type: String,
        default: '{}' // Default to a string representing an empty object
    }
});

const Project = mongoose.model("Project", projectSchema);

export default Project;