import { Router } from "express";
import * as chatPersonalController from "../controllers/chat.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.get(
  "/:id",
  verifyToken,
  checkRole(["Creators", "Users"]),
  chatPersonalController.getIdRoomPersonal
);

router.post(
  "/get/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  chatPersonalController.getAllRoomPersonal
);

router.post(
  "/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  chatPersonalController.createRoomPersonal
);
export default router;
