import { Router } from "express";
import * as userController from "../controllers/users.controllers";
import upload from "../middleware/upload";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";

const router = Router();

// GET & POST biasa (pakai JSON)
router.get("/", verifyToken, checkRole(["Creators", "Users"]), userController.getUser);
router.post("/", verifyToken, checkRole(["Creators", "Users"]), userController.createUser);
router.get("/:id", verifyToken, checkRole(["Creators", "Users"]), userController.getUserId);

// PUT dengan file upload (multipart/form-data)
// multer.handle dulu, JSON parser tidak perlu
router.put("/:id", verifyToken, checkRole(["Users"]), upload.single("foto"), userController.updateUser);

export default router;
