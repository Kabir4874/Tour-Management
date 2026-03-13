import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { BookingRoutes } from "../modules/booking/booking.route.js";
import { DivisionRoutes } from "../modules/division/division.route.js";
import { OtpRoutes } from "../modules/otp/otp.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { StatsRoutes } from "../modules/stats/stats.route.js";
import { TourRoutes } from "../modules/tour/tour.route.js";
import { UserRoutes } from "../modules/user/user.route.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
  {
    path: "/tour",
    route: TourRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
