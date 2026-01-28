import { Request, Response } from "express";
import { Op } from "sequelize"; 
import db from "../models";

export const createGroupChat = async (req: Request, res: Response) => {
  const { name_group, id_users } = req.body;
  const foto_group: string | null = req.file
    ? `${req.protocol}://${req.get("host")}/imagesGroup/${req.file.filename}`
    : null;

  const t = await db.sequelize.transaction();

  try {
    const newGroupChat = await db.GroupChat.create(
      {
        name_group,
        foto_group,
        id_users,
      },
      { transaction: t },
    );

    console.log(newGroupChat);
    const createAdminGroup = await db.MemberGroupChat.create(
      {
        id_group_chat: newGroupChat.id_group_chat,
        id_users: id_users,
        role: "admin",
      },
      { transaction: t },
    );
    const groupMembers = await db.MemberGroupChat.findAll({
      where: { id_group_chat: newGroupChat.id_group_chat },
      include: [
        {
          model: db.User,
          as: "user", 
          attributes: [
            "id_users",
            "username",
            "first_name",
            "last_name",
            "foto",
          ], 
        },
      ],
      transaction: t,
    });
     await t.commit();
    console.log("Fetched groupMembers:", groupMembers);
    const mappedMembers = groupMembers.map((member: any) => {
      const user = member.user || { username: "Unknown Creator" }; 
      return user;
    });
    console.log("Mapped Members:", mappedMembers);
    res.status(200).json({
      groupChat: newGroupChat,
      admin: createAdminGroup,
      members: mappedMembers,
    });
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).send("Failed to create group chat.");
  }
};

export const getGroupChatAll = async (req: Request, res: Response) => {
  try {
    const { id_users } = req.body;
    const groupChats = await db.GroupChat.findAll({
      include: [
        {
          model: db.User,
          as: "members",
          through: { attributes: [] }, 
          attributes: [
            "id_users",
            "first_name",
            "last_name",
            "foto",
            "username",
          ],
          where: { id_users: { [Op.eq]: id_users } }, 
        },
      ]
    });

    const formattedGroupChats = groupChats.map((groupChat: any) => {
      const lastMessage = groupChat.messages?.[0] || null;

      return {
        id_group_chat: groupChat.id_group_chat,
        name_group: groupChat.name_group,
        foto_group: groupChat.foto_group,
        members: groupChat.members, 
        lastMessage: lastMessage
          ? {
              message: lastMessage.message,
              date: lastMessage.createdAt,
              user: lastMessage.user,
            }
          : null,
      };
    });
    res.status(200).json(formattedGroupChats); 
  } catch (error) {
    console.error("Failed to get all group chats:", error);
    res.status(500).json({ message: "Failed to get all group chats." });
  }
};

export const getIdGroup = async (req: Request, res: Response) => {
  try {
    const { id_group_chat } = req.params;
    console.log(id_group_chat);
    const group = await db.GroupChat.findOne({
      where: { id_group_chat },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = await db.MemberGroupChat.findAll({
      where: { id_group_chat },
    });

    res.status(200).json({
      message: "Success",
      group: group,
      members: members,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
