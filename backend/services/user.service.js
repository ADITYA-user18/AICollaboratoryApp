// services/user.service.js

import User from "../models/user.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Pass the plain password directly to User.create.
  // The pre('save') hook in the model will handle the hashing automatically.
  const user = await User.create({
    email,
    password: password,
  });

  return user;
};

export const getAllUsers = async ({ userId }) => {
  const allUsers = await User.find({
    _id: { $ne: userId }
  });
  return allUsers;
};