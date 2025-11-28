import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post("/login", AuthController.credentialsLogin);

export const AuthRoutes = router;
