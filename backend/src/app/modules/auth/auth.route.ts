import { Router } from "express";
import passport from "passport";
import envVars from "../../config/env.js";
import checkAuth from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword,
);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword,
);
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthController.setPassword,
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
