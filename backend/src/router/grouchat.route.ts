import { Router } from "express";
import * as GroupController from "../controllers/group.controllers";
import uploadGroup from "../middleware/uploadGroupChat";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";

const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["Creators","Users"]),
  uploadGroup.single("foto"),
  GroupController.createGroupChat,
);

router.post(
  "/getHeaderGroup",
  verifyToken,
  checkRole(["Users", "Creators"]),
  GroupController.getGroupChatAll,
);

router.get(
  "/:id_group_chat",
  verifyToken,
  checkRole(["Users", "Creators"]),
  GroupController.getIdGroup,
);

export default router;
