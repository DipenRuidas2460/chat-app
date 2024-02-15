import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../../chatLogic/chatLogics";
import ProfileMenu from "../miscellaneous/ProfileMenu";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie-player";
import animationData from "../../animation/typing.json";
import { useRef } from "react";
import { IoSend } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";

function SingleChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setloading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const { user, selectedChat, setSelectedChat, currentReceiver } = ChatState();
  const host = config.BCKHOST;
  const socket = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!selectedChat) {
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      setloading(true);

      const { data } = await axios.get(
        `${host}/message/${selectedChat.id}`,
        config
      );

      socket.current.emit("join chat", {
        sender: selectedChat?.chatSenderId,
        receiver: selectedChat?.personId,
        room: selectedChat?.id,
      });

      setMessages(data);
      setloading(false);
    } catch (err) {
      console.log(err);
      toast({
        title: "Error Occured!",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const sendMessages = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (newMessage) {
        socket.current.emit("stop typing", {
          room: selectedChat.id,
          sender: selectedChat.chatSenderId,
          receiver: selectedChat.personId,
        });
        try {
          const token = localStorage.getItem("token");
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };

          setNewMessage("");

          const { data } = await axios.post(
            `${host}/message`,
            {
              content: newMessage,
              chatId: selectedChat.id,
            },
            config
          );

          socket.current.emit("new message", {
            data: data,
            room: selectedChat.id,
            sender: selectedChat.chatsender.id,
            receiver: selectedChat.receive.id,
          });
          setMessages([...messages, data]);
        } catch (err) {
          console.log(err);
          toast({
            title: "Error Occured!",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.current.emit("typing", {
        room: selectedChat.id,
        sender: selectedChat.chatSenderId,
        receiver: selectedChat.personId,
      });
    }

    // Debouncing:--

    const lastTypingTime = new Date().getTime();
    const timerLength = 2500;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.current.emit("stop typing", {
          room: selectedChat.id,
          sender: selectedChat.chatSenderId,
          receiver: selectedChat.personId,
        });
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    socket.current = io(host);
    socket.current.emit("setup", user);
    socket.current.on("connected", () => setSocketConnected(true));

    socket.current.on("typing", ({ room, sender, receiver }) => {
      if (
        selectedChat !== undefined &&
        room === selectedChat.id &&
        receiver === selectedChat.chatSenderId &&
        sender === selectedChat.personId &&
        sender === currentReceiver.id
      ) {
        setIsTyping(true);
      }
    });

    socket.current.on("stop typing", ({ room, sender, receiver }) => {
      if (
        selectedChat !== undefined &&
        room === selectedChat.id &&
        receiver === selectedChat.chatSenderId &&
        sender === selectedChat.personId &&
        sender === currentReceiver.id
      ) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.current.off("setup", user);
      socket.current.off();
    };
  }, [
    socket,
    selectedChat,
    host,
    user,
    navigate,
    currentReceiver,
  ]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.current.on(
      "message recieved",
      ({ data, room, sender, receiver }) => {
        setMessages([...messages, data]);
      }
    );
  }, [socket, selectedChat, messages, currentReceiver]);

  return (
    <>
      {selectedChat !== undefined && Object.keys(selectedChat).length > 0 ? (
        <>
          <Box
            fontSize={{ base: "23px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            <>
              {getSender(user, [
                selectedChat?.chatsender,
                selectedChat?.receive,
              ])}

              <Box
                display="flex"
                justifyContent={{ base: "space-between" }}
                alignItems="center"
              >
                <ProfileMenu
                  user={getSenderFull(user, [
                    selectedChat.chatsender,
                    selectedChat.receive,
                  ])}
                />
              </Box>
            </>
          </Box>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessages} isRequired mt={3}>
              {istyping ? (
                <div>
                  <Lottie
                    play
                    loop
                    animationData={animationData}
                    style={{
                      marginBottom: 15,
                      marginLeft: 0,
                      height: 100,
                      width: 100,
                    }}
                  />
                </div>
              ) : (
                <></>
              )}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message..."
                  onChange={typingHandler}
                  value={newMessage}
                />
                <Button
                  size="sm"
                  borderRadius="50%"
                  backgroundColor="#333"
                  color="#fff"
                  _hover={{ backgroundColor: "#000" }}
                  onClick={sendMessages}
                >
                  <IoSend />
                </Button>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a partner to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
