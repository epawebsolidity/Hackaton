import { Router } from "express";
import * as signinController from "../controllers/signin.controllers";

const router = Router();

router.post("/", signinController.signIn);
router.get("/nonce", signinController.getNonce);
router.get("/session", signinController.getSession);
router.post("/refresh", signinController.refreshToken);
router.post("/logout", signinController.logout);

export default router;
