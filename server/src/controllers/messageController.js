const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");
const path = require("path");

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const loggedUserId = req.person.id;
    const currentDateAndTime = new Date();

    const year = currentDateAndTime.getFullYear();
    const month =
      currentDateAndTime.getMonth() + 1 < 10
        ? `0${currentDateAndTime.getMonth() + 1}`
        : `${currentDateAndTime.getMonth() + 1}`;
    const day =
      currentDateAndTime.getDate() < 10
        ? `0${currentDateAndTime.getDate()}`
        : `${currentDateAndTime.getDate()}`;
    const hours =
      currentDateAndTime.getHours() < 10
        ? `0${currentDateAndTime.getHours()}`
        : `${currentDateAndTime.getHours()}`;
    const minutes =
      currentDateAndTime.getMinutes() < 10
        ? `0${currentDateAndTime.getMinutes()}`
        : `${currentDateAndTime.getMinutes()}`;
    const seconds =
      currentDateAndTime.getSeconds() < 10
        ? `0${currentDateAndTime.getSeconds()}`
        : `${currentDateAndTime.getSeconds()}`;

    let file = null;
    let filTypeArr = null;
    let randomInRange = null;
    if (req.files?.allFiles) {
      file = req.files.allFiles;
      filTypeArr = file.name.split(".");
      randomInRange = Math.floor(Math.random() * 10) + 1;
      const filePath = path.join(
        __dirname,
        "../uploads/files/",
        `${randomInRange}_file.${filTypeArr[1]}`
      );
      await file.mv(filePath);
    }

    if (!content && !chatId) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid data passed into request" });
    }

    const newMessage = {
      content: content ? content : null,
      allFiles: file ? `${randomInRange}_file.${filTypeArr[1]}` : null,
      chatId: chatId,
      senderId: loggedUserId,
      createdAt: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
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

    if (
      populatedMessage?.msg?.chatSenderId ||
      populatedMessage?.msg?.chatsender?.id
    ) {
      const messageSenderId = populatedMessage?.msg?.chatSenderId;
      const messageChatSenderId = populatedMessage?.msg?.chatsender?.id;

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
    }

    console.log("populate:-", JSON.stringify(populatedMessage));

    const obj = {
      id: populatedMessage.id,
      sender: populatedMessage.sender,
      receiver: populatedMessage.msg.isGroupChat
        ? null
        : populatedMessage.senderId !== populatedMessage.msg.receive.id
        ? populatedMessage.msg.receive
        : populatedMessage.msg.chatsender.id,
    };

    await Chat.update(
      { createdAt: message.createdAt, latestMessage: populatedMessage },
      { where: { id: chatId } }
    );

    return res.status(200).json(populatedMessage);
  } catch (error) {
    console.log(error);
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
      if (
        messages[i]?.senderId ||
        messages[i].msg?.chatsender?.id ||
        messages[i].msg?.chatSenderId
      ) {
        const messageSenderId = messages[i]?.senderId;
        const chatMessSenderId = messages[i].msg?.chatsender?.id;
        const chatSenderPersonId = messages[i]?.msg?.chatSenderId;

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
    }

    return res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).send(error.message);
  }
});

module.exports = { allMessages, sendMessage };
