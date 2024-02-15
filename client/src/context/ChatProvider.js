// import { useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config/config";

const ChatContext = createContext();

function ChatProvider({ children }) {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  // const toast = useToast();
  const host = config.BCKHOST;
  const token = localStorage.getItem("token");
  const [currentReceiver, setCurrentReceiver] = useState({})


  useEffect(() => {
    if (token) {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      axios
        .get(`${host}/customer/getUserById`, config)
        .then(({ data }) => {
          if (data.status === "success") {
            setUser(data.data);
          }
        })
        .catch((err) => {
          if (err.message === "Request failed with status code 401") {
            localStorage.removeItem("token");
            navigate("/");
          } else {
            // toast({
            //   title: err.message,
            //   status: "warning",
            //   duration: 3000,
            //   isClosable: true,
            //   position: "top-right",
            // });
            console.log(err.message);
          }
        });
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        currentReceiver,
        setCurrentReceiver
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
