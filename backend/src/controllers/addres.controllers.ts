import { Request, Response } from "express";
import db from "../models";

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { address, status_address } = req.body;

    const newAddress = await db.Address.create({
      address,
      status_address,
    });

    return res.status(201).json({
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create address",
      error: error.message,
    });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  try {
    const addresses = await db.Address.findAll();

    return res.status(200).json({
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve addresses",
      error: error.message,
    });
  }
};

export const getAddressId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid ID format. Expected a single value.",
      });
    }

    const parsedId = isNaN(Number(id)) ? id : Number(id);

    const address = await db.Address.findByPk(parsedId);

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve address",
      error: error.message,
    });
  }
};
