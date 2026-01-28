import { Sequelize } from "sequelize";
import Address from "./address";
import Role from "./role";
import Subscribe from "./subscribe";
import User from "./user";
import ChatPersonal from "./chat";
import MessageChat from "./message";
import GroupChat from "./groupchat";
import MemberGroupChat from "./members";
import MessageGroupChat from "./messgroup";
import configFile from "../../config/config";

const env = process.env.NODE_ENV || "development";
const config: any = (configFile as any)[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config,
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Initialize models
User.initModel(sequelize);
Address.initModel(sequelize);
Role.initModel(sequelize);
Subscribe.initModel(sequelize);
ChatPersonal.initModel(sequelize);
MessageChat.initModel(sequelize);
GroupChat.initModel(sequelize);
MemberGroupChat.initModel(sequelize);
MessageGroupChat.initModel(sequelize);

// Associations
Subscribe.belongsTo(User, { foreignKey: "id_users", as: "user" });

Address.hasMany(User, { foreignKey: "id_address" });
Role.hasMany(User, { foreignKey: "id_role" });

User.hasMany(Subscribe, { foreignKey: "id_users" });
User.belongsTo(Address, { foreignKey: "id_address", as: "address" });
User.belongsTo(Role, { foreignKey: "id_role", as: "role" });

ChatPersonal.belongsTo(User, { foreignKey: "id_users1", as: "user1" });
ChatPersonal.belongsTo(User, { foreignKey: "id_users2", as: "user2" });

MessageChat.belongsTo(ChatPersonal, {
  foreignKey: "id_personal_chat",
  as: "personal_chat",
});
MessageChat.belongsTo(User, { foreignKey: "id_users", as: "user" });

ChatPersonal.hasMany(MessageChat, {
  foreignKey: "id_personal_chat",
  as: "messages",
});

// GroupChat and User (Many-to-Many relationship through MemberGroupChat)
GroupChat.belongsToMany(User, {
  through: MemberGroupChat,
  foreignKey: "id_group_chat",
  as: "members", // Alias for the users in the group
});

User.belongsToMany(GroupChat, {
  through: MemberGroupChat,
  foreignKey: "id_users",
  as: "groups", // Alias for the groups the user is part of
});

// GroupChat and MessageGroupChat (One-to-Many relationship)
GroupChat.hasMany(MessageGroupChat, {
  foreignKey: "id_group_chat",
  as: "messages",
});

// MessageGroupChat and User (Many-to-One relationship)
MessageGroupChat.belongsTo(User, {
  foreignKey: "id_users",
  as: "user",
});

// MemberGroupChat associations
MemberGroupChat.belongsTo(GroupChat, {
  foreignKey: "id_group_chat",
  as: "groupChat",
});

MemberGroupChat.belongsTo(User, {
  foreignKey: "id_users",
  as: "user",
});

// Exporting db object to access models in other files
const db = {
  sequelize,
  Sequelize,
  User,
  Address,
  Role,
  Subscribe,
  ChatPersonal,
  MessageChat,
  GroupChat,
  MemberGroupChat,
  MessageGroupChat,
};

export default db;
