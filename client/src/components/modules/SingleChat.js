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
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";
import UpdateGroupChatModel from "../miscellaneous/UpdateGroupChatModel";

let selectedChatCompare = null;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setloading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const {
    user,
    selectedChat,
    setSelectedChat,
    currentReceiver,
    notification,
    setNotification,
  } = ChatState();
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
        `${host}/message/${selectedChat?.id}`,
        config
      );

      socket.current.emit("join chat", {
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
      if (newMessage || selectedFile) {
        if (selectedChat?.chatSenderId && selectedChat?.personId) {
          socket.current.emit("stop typing", {
            room: selectedChat?.id,
            sender: selectedChat?.chatSenderId,
            receiver: selectedChat?.personId,
          });
        } else {
          socket.current.emit("stop typing group", {
            room: selectedChat?.id,
          });
        }

        try {
          const token = localStorage.getItem("token");

          const formData = new FormData();

          formData.append("content", newMessage);
          if (selectedFile) {
            formData.append("allFiles", selectedFile);
          }

          formData.append("chatId", selectedChat?.id);

          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          setNewMessage("");
          setSelectedFile("");

          const { data } = await axios.post(
            `${host}/message`,
            formData,
            config
          );

          if (selectedChat?.chatsender && selectedChat?.receive) {
            socket.current.emit("new message", {
              data: data,
              room: selectedChat?.id,
              sender: selectedChat?.chatsender?.id,
              receiver: selectedChat?.receive?.id,
            });
          } else {
            socket.current.emit("new message group", {
              data: data,
              room: selectedChat?.id,
              sender: data.senderId,
            });
          }

          setMessages([...messages, data]);
        } catch (err) {
          console.log(err.message);
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
    if (e.target?.files?.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else if (e.target.value) {
      setNewMessage(e.target.value);
    }

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      if (selectedChat?.chatSenderId && selectedChat?.personId) {
        socket.current.emit("typing", {
          room: selectedChat?.id,
          sender: selectedChat?.chatSenderId,
          receiver: selectedChat?.personId,
        });
      } else {
        socket.current.emit("typing group", {
          room: selectedChat?.id,
          sender: user?.id,
        });
      }
    }

    // Debouncing:--

    const lastTypingTime = new Date().getTime();
    const timerLength = 1000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        if (selectedChat?.chatSenderId && selectedChat?.personId) {
          socket.current.emit("stop typing", {
            room: selectedChat?.id,
            sender: selectedChat?.chatSenderId,
            receiver: selectedChat?.personId,
          });
        } else {
          socket.current.emit("stop typing group", {
            room: selectedChat?.id,
            sender: user?.id,
          });
        }
        setTyping(false);
      }
    }, timerLength);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && newMessage.trim() === "") {
      if (selectedChat?.chatSenderId && selectedChat?.personId) {
        socket.current.emit("stop typing", {
          room: selectedChat?.id,
          sender: selectedChat?.chatSenderId,
          receiver: selectedChat?.personId,
        });
      } else {
        socket.current.emit("stop typing group", {
          room: selectedChat?.id,
          sender: user?.id,
        });
      }
    }

    if (e.key === "Backspace" && newMessage.length > 0) {
      setNewMessage(newMessage.slice(0, -1));
    }
  };

  useEffect(() => {
    socket.current = io(host);
    socket.current.emit("setup", user);
    socket.current.on("connected", () => setSocketConnected(true));

    if (selectedChat?.chatSenderId && selectedChat?.personId) {
      socket.current.on("typing", ({ room, sender, receiver }) => {
        if (
          selectedChat !== undefined &&
          room === selectedChat?.id &&
          receiver === selectedChat?.chatSenderId &&
          sender === selectedChat?.personId &&
          sender === currentReceiver?.id
        ) {
          setIsTyping(true);
        }
      });

      socket.current.on("stop typing", ({ room, sender, receiver }) => {
        if (
          selectedChat !== undefined &&
          room === selectedChat?.id &&
          receiver === selectedChat?.chatSenderId &&
          sender === selectedChat?.personId &&
          sender === currentReceiver?.id
        ) {
          setIsTyping(false);
        }
      });
    } else {
      socket.current.on("typing group", ({ room, sender }) => {
        const arr = [...selectedChat?.users];
        function checkIndex(p) {
          return p.id === user.id;
        }
        const findInd = arr.findIndex(checkIndex);
        if (findInd !== -1) {
          arr.splice(findInd, 1);
          for (const p of arr) {
            if (
              selectedChat !== undefined &&
              room === selectedChat?.id &&
              p?.id === sender
            ) {
              setIsTyping(true);
            }
          }
        }
      });

      socket.current.on("stop typing group", ({ room, sender }) => {
        const newArr = [...selectedChat?.users];
        function checkIndex(p) {
          return p.id === user.id;
        }
        const findInd = newArr.findIndex(checkIndex);
        if (findInd !== -1) {
          newArr.splice(findInd, 1);
          for (const q of newArr) {
            if (
              selectedChat !== undefined &&
              room === selectedChat?.id &&
              q?.id === sender
            ) {
              setIsTyping(false);
            }
          }
        }
      });
    }

    return () => {
      socket.current.off();
      socket.current.off("setoff", user);
    };
  }, [socket, selectedChat, host, user, navigate, currentReceiver]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat?.chatSenderId && selectedChat?.personId) {
      socket.current.on(
        "message recieved",
        ({ data, room, sender, receiver }) => {
          if (
            selectedChat !== undefined &&
            room === selectedChat?.id &&
            receiver === selectedChat?.chatSenderId &&
            sender === selectedChat?.personId &&
            sender === currentReceiver?.id
          ) {
            if (!selectedChatCompare || selectedChatCompare.id !== data.id) {
              if (!notification.includes(data)) {
                setNotification([data, ...notification]);
                setFetchAgain(!fetchAgain);
              }
            } else {
              setMessages([...messages, data]);
            }
          }
        }
      );
    } else {
      socket.current.on("message recieved group", ({ data, room, sender }) => {
        if (!selectedChatCompare || selectedChatCompare.id !== data.id) {
          if (!notification.includes(data)) {
            setNotification([data, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          const arr = [...selectedChat?.users];
          function checkIndex(p) {
            return p.id === user.id;
          }
          const findInd = arr.findIndex(checkIndex);
          if (findInd !== -1) {
            arr.splice(findInd, 1);
            for (const j of arr) {
              if (
                selectedChat !== undefined &&
                room === selectedChat?.id &&
                j?.id === sender
              ) {
                setMessages([...messages, data]);
              }
            }
          }
        }
      });
    }
  }, [
    socket,
    selectedChat,
    messages,
    currentReceiver,
    user,
    fetchAgain,
    notification,
    setFetchAgain,
    setNotification,
  ]);

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
              {messages &&
                (selectedChat?.isGroupChat ? (
                  <>
                    {selectedChat?.chatName.toUpperCase()}
                    <UpdateGroupChatModel
                      fetchMessages={fetchMessages}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                    />
                  </>
                ) : (
                  <>
                    {getSender(user, [
                      selectedChat?.chatsender,
                      selectedChat?.receive,
                    ])}

                    <ProfileMenu
                      user={getSenderFull(user, [
                        selectedChat?.chatsender,
                        selectedChat?.receive,
                      ])}
                    />
                  </>
                ))}
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
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={typingHandler}
                />
                <label htmlFor="fileInput">
                  <FaPlus size={30} style={{ cursor: "pointer" }} />
                </label>
                {selectedFile && (
                  <Box mt={3}>
                    <Text fontWeight="bold">Selected File:</Text>
                    <Text>{selectedFile.name}</Text>
                  </Box>
                )}
                <Input
                  bg="#E0E0E0"
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a message..."
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
