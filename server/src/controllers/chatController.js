const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");
const { Op } = require("sequelize");

const accessChat = asyncHandler(async (req, res) => {
  try {
    const { personId } = req.body;

    if (!personId) {
      return res.status(400).send({
        status: false,
        message: "personId not sent with request body!",
      });
    }

    const isChat = await Chat.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { "$chatsender.id$": req.person.id },
              { "$receive.id$": req.person.id },
            ],
          },
          {
            [Op.or]: [
              { "$chatsender.id$": personId },
              { "$receive.id$": personId },
            ],
          },
          { isGroupChat: false },
        ],
      },
      include: [
        {
          model: User,
          as: "chatsender",
          attributes: ["id", "firstName", "lastName", "email", "photo"],
        },
        {
          model: User,
          as: "receive",
          attributes: ["id", "firstName", "lastName", "email", "photo"],
        },
        {
          model: Message,
          as: "msg",
        },
      ],
    });

    if (isChat.length > 0) {
      const chatSenId = isChat[0].chatSenderId;
      const chatSenObjId = isChat[0].chatsender.id;

      if (req.person.id !== chatSenId) {
        isChat[0].chatSenderId = req.person.id;
        isChat[0].personId = personId;
      }

      if (req.person.id !== chatSenObjId) {
        [isChat[0].chatsender, isChat[0].receive] = [
          isChat[0].receive,
          isChat[0].chatsender,
        ];
      }
      await isChat[0].save();

      return res.status(200).json({ isChat: isChat[0] });
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        chatSenderId: req.person.id,
        personId: personId,
      };

      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({
        where: { id: createdChat.id },
        include: [
          {
            model: User,
            as: "chatsender",
            attributes: ["id", "firstName", "lastName", "email", "photo"],
          },
          {
            model: User,
            as: "receive",
            attributes: ["id", "firstName", "lastName", "email", "photo"],
          },
          {
            model: Message,
            as: "msg",
          },
        ],
      });

      const chatSenId = fullChat.chatSenderId;
      const chatSenObjId = fullChat.chatsender.id;

      if (req.person.id !== chatSenId) {
        [fullChat.chatSenderId, fullChat.personId] = [
          fullChat.personId,
          fullChat.chatSenderId,
        ];
      }

      if (req.person.id !== chatSenObjId) {
        [fullChat.chatsender, fullChat.receive] = [
          fullChat.receive,
          fullChat.chatsender,
        ];
      }
      await fullChat.save();

      return res
        .status(200)
        .json({ fullChat, msg: "Suceessfully Fetch Chats!" });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      data: err,
    });
  }
});

const fetchChats = async (req, res) => {
  try {
    const results = await Chat.findAll({
      where: {
        [Op.or]: [
          { "$chatsender.id$": req.person.id },
          { "$receive.id$": req.person.id },
        ],
      },
      include: [
        {
          model: User,
          as: "chatsender",
          attributes: { exclude: ["password", "fpToken", "role", "updatedAt"] },
        },

        {
          model: User,
          as: "receive",
          attributes: ["id", "firstName", "lastName", "email", "photo"],
        },

        {
          model: Message,
          as: "msg",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (results.length > 0) {
      const loggedUserId = req.person.id;

      for (let i = 0; i < results.length; i++) {
        const chatSenId = results[i].chatSenderId;
        const chatSenObjId = results[i].chatsender.id;

        if (loggedUserId !== chatSenId) {
          [results[i].chatSenderId, results[i].personId] = [
            results[i].personId,
            results[i].chatSenderId,
          ];
        }

        if (loggedUserId !== chatSenObjId) {
          [results[i].chatsender, results[i].receive] = [
            results[i].receive,
            results[i].chatsender,
          ];
        }

        await results[i].save();
      }
      return res.status(200).send({ status: true, result: results });
    } else {
      return res.status(200).send({ status: true, result: results });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send({ msg: error.message });
  }
};

const createGroupChat = async (req, res) => {
  try {
    const { users, chatName } = req.body;
    if (!users || !chatName) {
      return res.status(400).send({ message: "Please fill all the fields" });
    }
    const parseUsers = JSON.parse(users);
    if (parseUsers.length < 2) {
      return res
        .status(400)
        .send({ msg: "More than 2 users are required to form a group chat!" });
    }
    parseUsers.push(req.person.id);

    const groupChat = await Chat.create({
      chatName: chatName,
      isGroupChat: true,
      users: parseUsers,
      groupAdminId: req.person.id,
    });

    const fullGroupChat = await Chat.findOne({
      where: { id: groupChat.id },
      include: [
        {
          model: User,
          as: "groupAdmin",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.status(200).json(fullGroupChat);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: error });
  }
};

const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByPk(chatId);

    if (!updatedChat) {
      return res.status(404).send({ message: "Chat Not Found" });
    }

    updatedChat.chatName = chatName;
    await updatedChat.save();

    const fullUpdatedChat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: "groupAdmin",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.json(fullUpdatedChat);
  } catch (error) {
    console.error("Error renaming group:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const removeFromGroup = async (req, res) => {
  try {
    const { chatId, personId } = req.body;

    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).send({ message: "Chat Not Found" });
    }

    if (Array.isArray(chat.users)) {
      const findInd = chat.users.indexOf(personId);
      if (findInd === -1) {
        return res.status(404).send({ message: "User not found in the chat" });
      } else {
        chat.users.splice(findInd, 1);
        await chat.save();
      }
    }

    const updatedChat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: "groupAdmin",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.json(updatedChat);
  } catch (error) {
    console.error("Error removing user from group:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", err: error.message });
  }
};

const addToGroup = async (req, res) => {
  try {
    const { chatId, personId } = req.body;

    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).send({ message: "Chat Not Found" });
    }

    if (Array.isArray(chat.users)) {
      chat.users.push(personId);
      await chat.save();
    }

    const updatedChat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: "groupAdmin",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.json(updatedChat);
  } catch (error) {
    console.error("Error adding user to group:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", err: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
