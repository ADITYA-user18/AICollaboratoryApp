import {Router} from "express";
import {body} from "express-validator";
import * as ProjectController from "../controllers/project.controller.js";
import  * as authMiddleware from "../middleware/auth.middleware.js";
import { removeUserFromProject } from '../controllers/project.controller.js';



const router = Router();

router.post("/create", (req, res, next) => {
  console.log("Incoming body:", req.body);
  next();
 }, authMiddleware.authUser,
   body("name").isString().withMessage("Project name must be a string"),
   ProjectController.createdProject
);

router.get('/all',
  authMiddleware.authUser,
  ProjectController.getAllProject
)


router.put('/add-user',
  authMiddleware.authUser,
  body("projectId")
    .isString()
    .withMessage("Project ID must be a string"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be a non-empty array")
    .custom((arr) => arr.every((u) => typeof u === "string"))
    .withMessage("Each user must be a string"),
  ProjectController.addUserToProject
)

router.get('/get-project/:projectId',
  authMiddleware.authUser,
  ProjectController.getProjectById
  )

router.put("/remove-user", removeUserFromProject);



router.delete(
  "/delete/:projectId",
  authMiddleware.authUser,
  ProjectController.deleteProject
);







export const projectRoutes = router;