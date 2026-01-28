import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface SubscribeAttributes {
  id_subscribe: string;
  id_creator: string;
  id_users: string;
  id_token: number;
  type_subscribe: string;
  status_subscribe: string;
}

export interface SubscribeCreationAttributes
  extends Optional<SubscribeAttributes, "id_subscribe"> {}

export default class Subscribe
  extends Model<SubscribeAttributes, SubscribeCreationAttributes>
  implements SubscribeAttributes
{
  declare id_subscribe: string;
  declare id_creator: string;
  declare id_users: string;
  declare id_token: number;
  declare type_subscribe: string;
  declare status_subscribe: string;

  static initModel(sequelize: Sequelize) {
    Subscribe.init(
      {
        id_subscribe: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_creator: { type: DataTypes.UUID, allowNull: false },
        id_users: { type: DataTypes.UUID, allowNull: false },
        id_token: { type: DataTypes.UUID, allowNull: false },
        type_subscribe: { type: DataTypes.STRING, allowNull: false },
        status_subscribe: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        modelName: "Subscribe",
        tableName: "Subscribes",
        timestamps: true,
      }
    );
  }

  static associate(models: any) {}
}
