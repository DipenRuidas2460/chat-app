import { Box, Stack, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import ChatLoading from "./modules/ChatLoading";
import { getSender } from "../chatLogic/chatLogics";
import config from "../config/config";

function MyChats({ fetchAgain }) {
  const [loggedUser, setLoggedUser] = useState();
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    setCurrentReceiver,
  } = ChatState();
  const toast = useToast();
  const host = config.BCKHOST;

  const setMyChat = (chat) => {
    setSelectedChat(chat);
    setCurrentReceiver(chat.receive);
  };

  const fetchAllChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${host}/chat`, config);

      setChats(response.data.result);
    } catch (err) {
      console.log(err);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(() => {

  }, []);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchAllChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      paddingTop={3}
      bg="#B51A1A"
      width="100%"
      height="83vh"
      borderRadius="lg"
    >
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#730000"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflow="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setMyChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat.id}
              >
                <Text>
                  {getSender(loggedUser, [chat?.chatsender, chat?.receive])}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}

export default MyChats;
