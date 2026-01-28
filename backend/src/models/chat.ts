// src/models/chat.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import MessageChat from "./message"; 
import User from "./user"; 

export interface PersonalChatAttributes {
  id_personal_chat: string;
  id_users1: string;
  id_users2: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PersonalChatCreationAttributes
  extends Optional<PersonalChatAttributes, "id_personal_chat"> {}

export default class PersonalChat
  extends Model<PersonalChatAttributes, PersonalChatCreationAttributes>
  implements PersonalChatAttributes
{
  declare id_personal_chat: string;
  declare id_users1: string;
  declare id_users2: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;

  declare user1?: User;
  declare user2?: User;
  declare messages?: MessageChat[];

  static initModel(sequelize: Sequelize) {
    PersonalChat.init(
      {
        id_personal_chat: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_users1: { type: DataTypes.UUID, allowNull: false },
        id_users2: { type: DataTypes.UUID, allowNull: false },
      },
      {
        sequelize,
        modelName: "PersonalChat",
        tableName: "PersonalChat",
        timestamps: true, 
      }
    );
  }

  static associate(models: any) {
    PersonalChat.belongsTo(User, {
      foreignKey: "id_users1",
      as: "user1",
    });
    PersonalChat.belongsTo(User, {
      foreignKey: "id_users2",
      as: "user2",
    });
    PersonalChat.hasMany(MessageChat, {
      foreignKey: "id_personal_chat",
      as: "messages", 
    });
  }
}
