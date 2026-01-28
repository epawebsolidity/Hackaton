import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize";

export const createRoomPersonal = async (req: Request, res: Response) => {
  try {
    const { id_users1, id_users2 } = req.body;

    if (!id_users1 || !id_users2) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    // Find existing chat or create a new one
    const [chatPersonal, created] = await db.ChatPersonal.findOrCreate({
      where: {
        [Op.or]: [
          { id_users1, id_users2 },
          { id_users1: id_users2, id_users2: id_users1 },
        ],
      },
      defaults: { id_users1, id_users2 },
    });

    return res.status(200).json({
      message: created
        ? "Chat Room created successfully"
        : "Chat Room already exists",
      data: chatPersonal,
      isNew: created,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create or get chat room",
      error: error.message,
    });
  }
};

export const getIdRoomPersonal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.session.user?.userId);

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await db.ChatPersonal.findOne({
      where: { id_personal_chat: id },
      include: [
        { model: db.User, as: "user1" },
        { model: db.User, as: "user2" },
      ],
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    const otherUser =
      chat.id_users1 === currentUserId ? chat.id_users2 : chat.id_users1;

    return res.status(200).json({
      chatRoom: chat,
      otherUser, 
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get chat",
      error: error.message,
    });
  }
};

export const getAllRoomPersonal = async (req: Request, res: Response) => {
  try {
    const { id_users } = req.body;

    if (!id_users) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const chats = await db.ChatPersonal.findAll({
      where: {
        [Op.or]: [{ id_users1: id_users }, { id_users2: id_users }],
      },
      include: [
        {
          model: db.User,
          as: "user1",
          attributes: [
            "id_users",
            "first_name",
            "last_name",
            "foto",
            "username",
          ],
        },
        {
          model: db.User,
          as: "user2",
          attributes: [
            "id_users",
            "first_name",
            "last_name",
            "foto",
            "username",
          ],
        },
        {
          model: db.MessageChat,
          as: "messages",
          limit: 1,
          order: [["date", "DESC"]],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!chats) {
      return res.status(404).json({ message: "No personal rooms found." });
    }

    const formatted = chats.map((chat) => {
      const otherUser = chat.id_users1 === id_users ? chat.user2 : chat.user1;
      const lastMessage = chat.messages?.[0] || null; 

      return {
        id_personal_chat: chat.id_personal_chat,
        otherUser,
        lastMessage,
        updatedAt: chat.updatedAt,
      };
    });

    res.status(200).json(formatted);
  } catch (err: any) {
    console.error("Failed to get all personal rooms:", err); 
    res.status(500).json({ message: err.message });
  }
};
