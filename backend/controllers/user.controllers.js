// controllers/user.controllers.js

import { validationResult } from "express-validator";
import * as userServices from "../services/user.service.js";
import User from '../models/user.model.js'
import redisClient  from "../services/redis.service.js";

export const CreateUserRegisterController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const createdUser = await userServices.createUser(req.body);
    const token = createdUser.generateJWT();

    const userToReturn = {
      _id: createdUser._id,
      email: createdUser.email,
      isAI: createdUser.isAI
    };

    res.status(201).json({
      user: userToReturn,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const LoginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = user.generateJWT();
    
    const userToReturn = {
        _id: user._id,
        email: user.email,
        isAI: user.isAI
    };

    res.status(200).json({
      message: "Login successful",
      user: userToReturn,
      token
    });

  }
  catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

export const profileController = async(req,res)=>{
  res.status(200).json({
    user:req.user
  })
}

export const logoutController = async(req,res)=>{
  try {
    const token = req.cookies.token || req.headers?.authorization?.split(' ')[1];
    if (token) {
        redisClient.set(token,'logout','EX', 60*60*24);
    }
    res.status(200).json({message:'Logout Successfully'})
    
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
}

export const getAllUsers = async(req,res)=>{
  try {
    const loggedInUser = await User.findOne({
      email:req.user.email
    })
    const userId = loggedInUser._id
    const allUsers = await userServices.getAllUsers({userId:userId})
    return res.status(200).json({
      users:allUsers
    })
  } catch (error) {
    console.log('Error',error)
    res.status(400).json({error:error.message}) 
  }
}