// src/models/messageGroupChat.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import GroupChat from "./groupchat"; // Import the GroupChat model
import User from "./user";

export interface MessageGroupChatAttributes {
  id_message_group: string;
  id_group_chat: string;
  id_users: string;
  message: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageGroupChatCreationAttributes
  extends Optional<MessageGroupChatAttributes, "id_message_group"> {}

export default class MessageGroupChat
  extends Model<MessageGroupChatAttributes, MessageGroupChatCreationAttributes>
  implements MessageGroupChatAttributes
{
  declare id_message_group: string;
  declare id_group_chat: string;
  declare id_users: string;
  declare message: string;
  declare date: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;

  static initModel(sequelize: Sequelize) {
    MessageGroupChat.init(
      {
        id_message_group: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4, // UUID for each message
        },
        id_group_chat: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        id_users: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "MessageGroupChat",
        tableName: "MessageGroupChats",
        timestamps: true,
      }
    );
  }

  // Define associations
  static associate(models: any) {
  MessageGroupChat.belongsTo(GroupChat, {
    foreignKey: "id_group_chat",
    as: "groupChat",
  });

  MessageGroupChat.belongsTo(User, {
    foreignKey: "id_users",
    as: "user",
  });
}

}
