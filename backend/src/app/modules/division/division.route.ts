import { Router } from "express";
import { multerUpload } from "../../config/multer.js";
import checkAuth from "../../middlewares/checkAuth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { DivisionController } from "./division.controller.js";
import {
  createDivisionSchema,
  updateDivisionSchema,
} from "./division.validation.js";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("image"),
  validateRequest(createDivisionSchema),
  DivisionController.createDivision,
);

router.get("/", DivisionController.getAllDivisions);
router.get("/:slug", DivisionController.getSingleDivision);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("image"),
  validateRequest(updateDivisionSchema),
  DivisionController.updatedDivision,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DivisionController.deleteDivision,
);

export const DivisionRoutes = router;
