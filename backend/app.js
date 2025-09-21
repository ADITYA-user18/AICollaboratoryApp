import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connecter from "./database/mongoose.js";
import userRoutes from "./routes/user.route.js"; 
import { projectRoutes } from "./routes/project.route.js";
import cookieParser from "cookie-parser";
import aiRoutes from './routes/ai.routes.js'
import cors from 'cors'
import codeRoutes from './routes/codeRoutes.js'
// import {authRoutes} from './routes/auth.routes.js'

dotenv.config(); 

// Initialize Express app
const app = express();

// Connect to MongoDB
connecter();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use('/ai',aiRoutes);
app.use("/api/code", codeRoutes);
// app.use("/api/auth", authRoutes);

// Test route
app.get("/adi", (req, res) => {
  res.send("Hello I got you");
});

export default app;
