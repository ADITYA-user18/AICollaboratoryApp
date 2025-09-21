// services/project.service.js

import { mongoose } from "mongoose";
import ProjectModel from "../models/project.model.js";

// ... createProject, getAllProjectByUserId, addUserToProject remain unchanged ...
export const createProject = async (name, userId) => {
  if (!name) throw new Error("Project name is required");
  if (!userId) throw new Error("User ID is required to create a project");

  const project = await ProjectModel.create({
    name,
    users: [userId],
  });

  return project;
};


export const getAllProjectByUserId = async ({ userId }) => {

  if (!userId) {
    throw new Error('UserId id required')
  }


  const allUserProjects = await ProjectModel.find({
    users: userId
  })
  return allUserProjects
}



export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error('ProjectId is required')
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error('Invalid ProjectId')
  }

  if (!users) {
    throw new Error('Users array is required')
  }
  if (!userId) {
    throw new Error('Requesting userId is required')
  }

  if (!Array.isArray(users) || users.some(userId =>
    !mongoose.Types.ObjectId.isValid(userId))) {
    throw new Error('Invalid users array')
  }
  const project = await ProjectModel.findOne({
    _id: projectId,
    users: userId.toString()
  })


  if (!project) {
    throw new Error('Project not found or you are not authorized to add users')
  }


  const updatedProject = await ProjectModel.findOneAndUpdate({
    _id: projectId
  }, {
    $addToSet: { users: { $each: users } }
  }, {
    new: true
  })


  return updatedProject
}


// ✅ FIX: This function now parses the fileTree string back into an object.
export const getProjectById = async ({ projectId, userId }) => {
  if (!projectId) throw new Error("ProjectId is required");
  if (!mongoose.Types.ObjectId.isValid(projectId)) throw new Error("Invalid ProjectId");

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const project = await ProjectModel.findOne({
    _id: projectId,
    users: userObjectId,
  })
  .populate("users", "email")
  .populate({
      path: "messages.sender",
      select: "email _id isAI"
  });

  if (!project) {
    return null;
  }

  // Convert the Mongoose document to a plain JavaScript object to make it mutable
  const projectObject = project.toObject();

  // Parse the fileTree string back into an object
  try {
    projectObject.fileTree = JSON.parse(projectObject.fileTree || '{}');
  } catch (e) {
    console.error("Failed to parse fileTree JSON:", e);
    projectObject.fileTree = {}; // Default to an empty object on parsing error
  }
  
  return projectObject;
};

// ... deleteProjectById remains unchanged ...
export const deleteProjectById = async ({ projectId, userId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!userId) {
    throw new Error("User ID is required for authorization");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }

  // Find the project by its ID AND ensure the requesting user is in the 'users' array.
  // This is a critical security check to prevent users from deleting projects they don't belong to.
  const deletedProject = await ProjectModel.findOneAndDelete({
    _id: projectId,
    users: userId,
  });

  if (!deletedProject) {
    // This will trigger if the project doesn't exist OR if the user is not a member.
    throw new Error("Project not found or user not authorized to delete");
  }

  return deletedProject;
};