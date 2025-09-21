import { validationResult } from "express-validator";
import * as  ProjectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import Project from "../models/project.model.js";

// --- This function is correct and remains unchanged ---
export const createdProject = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;
        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Project name must be a string" });
        }

        const loggedUser = await userModel.findOne({ email: req.user.email });
        if (!loggedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const NewProject = await ProjectService.createProject(name, loggedUser._id);

        res.status(201).json({
            message: "Project created successfully",
            project: NewProject
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- This function is correct and remains unchanged ---
export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUserProjects = await ProjectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (error) {
        console.log('Error', error)
        res.status(400).json({ error: error.message })
    }
}

// ✅ FIX: This function now returns the fully populated project object after adding a user.
export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findById(req.user.id);

        // This service call correctly adds the user
        const project = await ProjectService.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });
        
        // CRITICAL FIX: After adding, we re-fetch the project and populate the `users` field
        // to ensure the frontend receives the complete data it needs to update the UI.
        const populatedProject = await Project.findById(project._id).populate("users", "email name");

        return res.status(200).json({
            message: 'Users added successfully to project',
            project: populatedProject // Send the fully populated project back
        });

    } catch (error) {
        console.log('Error', error)
        res.status(400).json({ error: error.message })
    }
}

// --- This function is correct and remains unchanged ---
export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id; // from auth middleware

  try {
    const project = await ProjectService.getProjectById({ projectId, userId });
    if (!project) {
      return res.status(404).json({ error: "Project not found or access denied" });
    }
    return res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ FIX: This function now returns the fully populated project object after removing a user.
export const removeUserFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({ message: "Project ID and User ID are required" });
    }

    // First, update the project by removing the user
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { users: userId } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // CRITICAL FIX: After removing, populate the updated `users` array before sending the response.
    const populatedProject = await Project.findById(project._id).populate("users", "email name");

    res.json({ 
        message: "User removed successfully", 
        project: populatedProject // Send the fully populated project back
    });

  } catch (err) {
    console.error("Error in removeUserFromProject:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADDED: The deleteProject function is now correctly part of your controller file.
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; // From your auth middleware

    await ProjectService.deleteProjectById({ projectId, userId });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found or user not authorized")) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error" });
  }
};