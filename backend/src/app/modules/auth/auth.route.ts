import { Router } from "express";
import passport from "passport";
import checkAuth from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword
);
router.get("/google", AuthController.googleLogin);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthController.googleCallback
);
export const AuthRoutes = router;
