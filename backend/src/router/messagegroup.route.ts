import { Router } from "express";
import * as messageGroupController from "../controllers/messagegroup.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  messageGroupController.createMessageGroup
);

router.post(
  "/getChatGroup/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  messageGroupController.getMessageByGroupChatId
);

export default router;
