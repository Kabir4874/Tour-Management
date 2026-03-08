import { Router } from "express";
import passport from "passport";
import envVars from "../../config/env.js";
import checkAuth from "../../middlewares/checkAuth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { AuthController } from "./auth.controller.js";
import {
  changePasswordZodSchema,
  credentialsLoginZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
  setPasswordZodSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
  "/login",
  validateRequest(credentialsLoginZodSchema),
  AuthController.credentialsLogin,
);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  validateRequest(changePasswordZodSchema),
  AuthController.changePassword,
);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  validateRequest(resetPasswordZodSchema),
  AuthController.resetPassword,
);
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  validateRequest(setPasswordZodSchema),
  AuthController.setPassword,
);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordZodSchema),
  AuthController.forgotPassword,
);

router.get("/google", AuthController.googleLogin);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact to our support team!`,
  }),
  AuthController.googleCallback,
);

export const AuthRoutes = router;
