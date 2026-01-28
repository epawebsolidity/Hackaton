import { Router } from "express";
import * as subscibeController from "../controllers/subscribe.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.post("/getSUb", verifyToken, checkRole(["Creators","Users"]), subscibeController.getSubscribe);
router.post("/", verifyToken, checkRole(["Creators","Users"]), subscibeController.createSubscribe);
router.get("/:id_users", verifyToken, checkRole(["Creators","Users"]), subscibeController.getSubscribeUserProfileId);
export default router;
