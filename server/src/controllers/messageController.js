const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;

    const loggedUserId = req.person.id;

    if (!content && !chatId) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid data passed into request" });
    }

    const newMessage = {
      content: content,
      chatId: chatId,
      senderId: loggedUserId,
    };

    const message = await Message.create(newMessage);

    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: Chat,
          as: "msg",
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
          ],
        },
        {
          model: User,
          as: "sender",
          attributes: {
            exclude: ["password", "fpToken", "updatedAt", "createdAt", "role"],
          },
        },
      ],
    });

    await Chat.update(
      { createdAt: message.createdAt, latestMessage: populatedMessage },
      { where: { id: chatId } }
    );

    const messageSenderId = populatedMessage.msg.chatSenderId;
    const messageChatSenderId = populatedMessage.msg.chatsender.id;

    if (loggedUserId !== messageSenderId) {
      populatedMessage.msg.personId = messageSenderId;
      populatedMessage.msg.chatSenderId = loggedUserId;
    }

    if (loggedUserId !== messageChatSenderId) {
      [populatedMessage.msg.chatsender, populatedMessage.msg.receive] = [
        populatedMessage.msg.receive,
        populatedMessage.msg.chatsender,
      ];
    }

    await populatedMessage.save();
    return res.status(200).json(populatedMessage);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { chatId: req.params.chatId },
      include: [
        {
          model: Chat,
          as: "msg",
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
          ],
        },
        {
          model: User,
          as: "sender",
          attributes: {
            exclude: ["password", "fpToken", "updatedAt", "createdAt", "role"],
          },
        },
      ],
    });

    for (let i = 0; i < messages.length; i++) {
      const messageSenderId = messages[i].senderId;
      const chatMessSenderId = messages[i].msg.chatsender.id;
      const chatSenderPersonId = messages[i].msg.chatSenderId;

      if (messageSenderId !== chatSenderPersonId) {
        [messages[i].msg.chatSenderId, messages[i].msg.personId] = [
          messages[i].msg.personId,
          messages[i].msg.chatSenderId,
        ];
      }

      if (messageSenderId !== chatMessSenderId) {
        [messages[i].msg.chatsender, messages[i].msg.receive] = [
          messages[i].msg.receive,
          messages[i].msg.chatsender,
        ];
      }

      await messages[i].save();
    }

    return res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).send(error.message);
  }
});

module.exports = { allMessages, sendMessage };
