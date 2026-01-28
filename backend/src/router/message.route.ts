import { Router } from "express";
import * as messageController from "../controllers/message.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  messageController.createMessage
);

router.post(
  "/get/",
  verifyToken,
  checkRole(["Creators", "Users"]),
  messageController.getMessageByChatId
);
export default router;
