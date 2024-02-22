const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");
const User = require("./user");

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatName: {
      type: DataTypes.STRING,
    },
    isGroupChat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    users:{
      type: DataTypes.JSON,
    },
    chatSenderId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    personId: {
      type: DataTypes.INTEGER,
    },
    groupAdminId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "Chat",
    updatedAt: false,
  }
);

(async () => {
  await Chat.sync({ force: false });
})();

Chat.belongsTo(User, { foreignKey: "chatSenderId", as: "chatsender" });
Chat.belongsTo(User, { foreignKey: "personId", as: "receive" });
Chat.belongsTo(User, { foreignKey: "groupAdminId", as: "groupAdmin" });

module.exports = Chat;