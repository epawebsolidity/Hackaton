import { Router } from "express";
import * as addresController from "../controllers/addres.controllers";

const router = Router();

// Create address
router.post("/", addresController.createAddress);

// Get all addresses
router.get("/", addresController.getAddress);

// Get address by ID
router.get("/:id", addresController.getAddressId);

export default router;
