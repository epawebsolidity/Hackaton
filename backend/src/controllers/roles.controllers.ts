import { Request, Response } from "express";
import db from '../models';

export const createRoles = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const newRoles = await db.Role.create({
      role
    });

    return res.status(201).json({
      message: "Roles created successfully",
      data: newRoles,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};