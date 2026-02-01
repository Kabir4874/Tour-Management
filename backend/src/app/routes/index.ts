import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { DivisionRoutes } from "../modules/division/division.route.js";
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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
