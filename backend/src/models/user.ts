import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface UserAttributes {
  id_users: string;
  id_address: string;
  id_role: string;
  first_name: string;
  last_name: string;
  username: string;
  foto?: string;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id_users" | "username"
> {}

export default class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare email: string;
  declare username: string;
  declare id_users: string;
  declare id_address: string;
  declare id_role: string;
  declare first_name: string;
  declare last_name: string;
  declare foto?: string;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id_users: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_address: { type: DataTypes.UUID, allowNull: false },
        id_role: { type: DataTypes.UUID, allowNull: false },
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          defaultValue: "",
        },
        foto: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: "Users" },
    );
  }
}
