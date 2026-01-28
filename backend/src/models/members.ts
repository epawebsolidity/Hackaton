// src/models/memberGroupChat.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import User from "./user"; // Import the User model
import GroupChat from "./groupchat"; // Import the GroupChat model

export interface MemberGroupChatAttributes {
  id_member_group: string;
  id_group_chat: string;
  id_users: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MemberGroupChatCreationAttributes extends Optional<
  MemberGroupChatAttributes,
  "id_member_group"
> {}

export default class MemberGroupChat
  extends Model<MemberGroupChatAttributes, MemberGroupChatCreationAttributes>
  implements MemberGroupChatAttributes
{
  declare id_member_group: string;
  declare id_group_chat: string;
  declare role: string;
  declare id_users: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;

  static initModel(sequelize: Sequelize) {
    MemberGroupChat.init(
      {
        id_member_group: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_group_chat: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        id_users: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "MemberGroupChat",
        tableName: "MemberGroupChats",
        timestamps: true,
      },
    );
  }

  static associate(models: any) {
    // Define relationship with GroupChat
    MemberGroupChat.belongsTo(GroupChat, {
      foreignKey: "id_group_chat",
      as: "groupChat",
    });

    // Define relationship with User
    MemberGroupChat.belongsTo(User, {
      foreignKey: "id_users",
      as: "user",
    });
  }
}
