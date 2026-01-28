import { Request, Response } from "express";
import db from "../models";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { id_personal_chat, id_users, message } = req.body;

    if (!id_personal_chat || !message) {
      return res
        .status(400)
        .json({ error: "id_personal_chat and message are required" });
    }

    if (!id_users) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chat = await db.ChatPersonal.findByPk(id_personal_chat);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const newMessage = await db.MessageChat.create({
      id_personal_chat,
      id_users,
      message,
      date: new Date().toISOString(),
    });

    const fullMessage = await db.MessageChat.findByPk(newMessage.id_message, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id_users", "first_name", "last_name", "foto"],
        },
      ],
    });

    return res.status(201).json({ message: fullMessage });
  } catch (err) {
    console.error("Error creating message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessageByChatId = async (req: Request, res: Response) => {
  try {
    const { id_personal_chat } = req.body; // read from POST body
    console.log("Received id_personal_chat:", id_personal_chat);

    if (!id_personal_chat) {
      return res.status(400).json({ error: "id_personal_chat is required" });
    }

    const messages = await db.MessageChat.findAll({
      where: { id_personal_chat },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id_users", "first_name", "last_name", "foto"],
        },
      ],
    });
    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
