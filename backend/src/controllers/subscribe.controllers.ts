import { Request, Response } from "express";
import db from "../models";

export const createSubscribe = async (req: Request, res: Response) => {
  try {
    const { subscibe } = req.body;

    if (!subscibe) {
      return res.status(400).json({
        message: "subscibe is required",
      });
    }

    const newSubscribe = await db.Subscribe.create({
      id_creator: subscibe.id_creator,
      id_users: subscibe.id_users,
      id_token: 110011,
      type_subscribe: subscibe.type_subscribe,
      status_subscribe: "active",
    });

    if (newSubscribe) {
      const CekeGroup = await db.GroupChat.findOne({
        where: {
          id_users: subscibe.id_creator,
        },
      });

      if (CekeGroup) {
        await db.MemberGroupChat.create({
          id_group_chat: CekeGroup.id_group_chat,
          id_users: subscibe.id_users,
          role: "users",
        });
      }
    }

    return res.status(200).json({
      message: "Roles created successfully",
      data: "success",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const getSubscribe = async (req: Request, res: Response) => {
  try {
    const { id_users } = req.body;
    console.log(id_users);
    if (!id_users) {
      return res.status(400).json({
        message: "id_users is required",
      });
    }

    const subscribes = await db.Subscribe.findAll({
      where: { id_users },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id_users", "first_name", "last_name", "foto"],
        },
      ],
    });

    console.log(subscribes);

    return res.status(200).json({
      message: "Get subscribes success",
      data: subscribes,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get subscribes",
      error: error.message,
    });
  }
};

export const getSubscribeUserProfileId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id_users } = req.params;

    if (!id_users) {
      return res.status(400).json({
        success: false,
        message: "id_users is required",
      });
    }

    const subscribes = await db.Subscribe.findAll({
      where: { id_users },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id_users", "first_name", "last_name", "foto"],
        },
      ],
    });

    console.log("SUBSCRIBES:", subscribes);

    return res.status(200).json({
      success: true,
      message: "Get subscribes success",
      data: subscribes,
    });
  } catch (error) {
    console.error("getSubscribeUserProfileId error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
