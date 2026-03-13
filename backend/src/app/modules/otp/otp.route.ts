import express from "express";
import { OTPController } from "./otp.controller.js";

const router = express.Router();

router.post("/send", OTPController.sendOTP);
router.post("/verify", OTPController.verifyOTP);

export const OtpRoutes = router;
