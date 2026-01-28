import { Request, Response } from "express";
import db from "../models";

export const createMessageGroup = async (req: Request, res: Response) => {
  try {
    const { id_group_chat, id_users, message } = req.body;
    console.log(id_group_chat);
    console.log(id_users);
    console.log(message);

    if (!id_group_chat || !message) {
      return res
        .status(400)
        .json({ error: "id_group_chat and message are required" });
    }

    const newMessage = await db.MessageGroupChat.create({
      id_group_chat,
      id_users,
      message,
      date: new Date().toString(), // safe
    });

    // include user info
    const fullMessage = await db.MessageGroupChat.findByPk(
      newMessage.id_message_group,
      {
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id_users", "first_name", "last_name", "foto"],
          },
        ],
      },
    );

    return res.status(201).json(fullMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessageByGroupChatId = async (req: Request, res: Response) => {
  try {
    const { id_group_chat } = req.body;

    console.log("Received id_group_chat:", id_group_chat);

    if (!id_group_chat) {
      return res.status(400).json({
        error: "id_group_chat is required",
      });
    }

    const messages = await db.MessageGroupChat.findAll({
      where: { id_group_chat },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: db.User,
          as: "user",
          attributes: [
            "id_users",
            "first_name",
            "last_name",
            "foto",
            "username",
          ],
        },
      ],
    });

    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
