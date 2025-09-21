// models/user.model.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  isAI: {
    type: Boolean,
    default: false,
  },
});

// Automatically hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find or create the AI user
userSchema.statics.findOrCreateAIUser = async function () {
  const AI_EMAIL = "ai-assistant@system.internal";
  try {
    let aiUser = await this.findOne({ email: AI_EMAIL });
    if (!aiUser) {
      aiUser = await this.create({
        email: AI_EMAIL,
        password: "UNUSABLE_PASSWORD_BECAUSE_IT_WILL_BE_HASHED",
        isAI: true,
      });
      console.log("AI user created in the database.");
    }
    return aiUser;
  } catch (error) {
    console.error("Error finding or creating AI user:", error);
    throw error;
  }
};

// Instance method to compare password for login
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to generate JWT
userSchema.methods.generateJWT = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;