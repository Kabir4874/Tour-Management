import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { PaymentController } from "./payment.controller.js";

const router = Router();

router.post("/init-payment/:bookingId", PaymentController.initPayment);
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);
router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  PaymentController.getInvoiceDownloadUrl,
);

export const PaymentRoutes = router;
