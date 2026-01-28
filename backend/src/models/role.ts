import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface RoleAttributes {
  id_role: string;
  role: string;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, "id_role"> {}

export default class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id_role: string;
  declare role: string;

  static initModel(sequelize: Sequelize) {
    Role.init(
      {
        id_role: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Role",
        tableName: "Roles",
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    
  }
}
