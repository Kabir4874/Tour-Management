import express from "express";

const router = express.Router();

router.post("/send");
router.post("/verify");

export const OtpRoutes = router;
