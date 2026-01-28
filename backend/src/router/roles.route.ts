import { Router } from "express";
import * as rolesController from "../controllers/roles.controllers";
import { verifyToken } from "../middleware/verify.token";

const router = Router();

router.post("/", verifyToken, rolesController.createRoles);

export default router;
