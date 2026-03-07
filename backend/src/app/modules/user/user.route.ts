import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { UserController } from "./user.controller.js";
import { Role } from "./user.interface.js";
import { createUserZodSchema } from "./user.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers,
);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.getSingleUser,
);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.updateUser,
);

export const UserRoutes = router;
