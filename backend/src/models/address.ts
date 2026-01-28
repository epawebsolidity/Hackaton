import { DataTypes, Model, Sequelize } from "sequelize";

export default class Address extends Model {
  declare id_address: string;
  declare address: string;
  declare status_address: string;

  static initModel(sequelize: Sequelize) {
    Address.init(
      {
        id_address: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        address: { type: DataTypes.STRING, allowNull: false, unique: true },
        status_address: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "active",
        },
      },
      {
        sequelize,
        tableName: "Addresses",
      }
    );
  }
}
