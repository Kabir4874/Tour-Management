import { Router } from "express";
import { UserController } from "./user.controller.js";

const router = Router();

router.post("/register", UserController.createUser);

export const UserRoutes = router;
