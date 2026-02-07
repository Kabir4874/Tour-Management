import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { BookingController } from "./booking.controller.js";
import { createBookingZodSchema } from "./booking.validation.js";

const router = Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  validateRequest(createBookingZodSchema),
  BookingController.createBooking,
);

export const BookingRoutes = router;
