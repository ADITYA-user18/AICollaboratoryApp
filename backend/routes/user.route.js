import { Router } from "express";
import { body } from "express-validator";
import {CreateUserRegisterController,LoginController,logoutController,profileController,getAllUsers} from "../controllers/user.controllers.js";
import * as authMiddleware from '../middleware/auth.middleware.js'
import { get } from "mongoose";

const router = Router();

// Register route
router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  CreateUserRegisterController
);

//login route
router.post('/login',
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  LoginController
)


// profile route
router.get('/profile',  authMiddleware.authUser,profileController)


//logout route
router.get('/logout',logoutController)



router.get('/all',authMiddleware.authUser,getAllUsers)


export default router;
