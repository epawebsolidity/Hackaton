import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import PersonalChat from "./chat";

export interface MessageChatAttributes {
  id_message: string;
  id_personal_chat: string;
  id_users: string;
  message: Text;
  date: string;
}

export interface MessageCreationAttributes
  extends Optional<MessageChatAttributes, "id_message"> {}

export default class MessageChat
  extends Model<MessageChatAttributes, MessageCreationAttributes>
  implements MessageChatAttributes
{
  declare id_message: string;
  declare id_personal_chat: string;
  declare id_users: string;
  declare message: Text;
  declare date: string;

  static initModel(sequelize: Sequelize) {
    MessageChat.init(
      {
        id_message: {
          type: DataTypes.UUID, // UUID -> CHAR(36)
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_personal_chat: { type: DataTypes.UUID, allowNull: false }, // ✅ matches Users.id_users
        id_users: { type: DataTypes.UUID, allowNull: false }, // ✅ matches Users.id_users
        message: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        modelName: "MessageChat",
        tableName: "MessageChats",
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    MessageChat.belongsTo(PersonalChat, {
      foreignKey: "id_personal_chat",
      as: "personal_chat", // This is the alias used in the include
    });
    MessageChat.belongsTo(PersonalChat, {
      foreignKey: "id_users",
      as: "user",
    });
  }
}
