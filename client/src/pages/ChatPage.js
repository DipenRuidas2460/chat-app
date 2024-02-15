import { ChatState } from "../context/ChatProvider";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideBarDrawer from "../components/miscellaneous/SideBarDrawer";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Tooltip,
  Text,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import UserListItems from "../components/userAvatar/UserListItems";
import ChatLoading from "../components/modules/ChatLoading";
import config from "../config/config";

function ChatPage({ token, userInfo }) {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setSelectedChat, chats, setChats, selectedChat } = ChatState();

  const toast = useToast();
  const host = config.BCKHOST;

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter somthing in search!",
        status: "warning",
        duration: 3000,
        isCloseable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${host}/customer/getAllUsers?search=${search}`,
        config
      );

      setLoading(false);
      setSearchResult(response.data.data);
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

  const accessChat = async (personId) => {
    try {
      setLoadingChat(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${host}/chat`, { personId }, config);

      let allChats;
      if (response.data.fullChat !== undefined) {
        allChats = response.data.fullChat;
      } else {
        allChats = response.data.isChat;
      }

      if (!chats?.find((c) => c?.id === allChats.id))
        setChats([allChats, ...chats]);

      setSelectedChat(allChats);
      setLoadingChat(false);
      onClose();
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

  return (
    <div>
      {token ? (
        <Box position="relative">
          <div className="black-space-div-chat"></div>
          <div className="white-space-div-chat">
            <Box
              width="80%"
              position="absolute"
              left="10%"
              bottom="10%"
              boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
              borderRadius="10px"
              bg="#fff"
            >
              {user && <SideBarDrawer />}
              <div className="newChatPage">
                <Box
                  display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
                  flexDirection="column"
                  justifyContent="space-evenly"
                  alignItems="center"
                  w={{ base: "100%", md: "31%" }}
                  borderRadius="lg"
                  bg="#B51A1A"
                >
                  <Tooltip
                    label="Search Partners to Chat"
                    hasArrow
                    placement="bottom-end"
                  >
                    <Button
                      variantcolor="#fff"
                      variant="solid"
                      width="94%"
                      marginTop="13px"
                      onClick={onOpen}
                    >
                      <i className="fas fa-search"></i>
                      <Text display={{ base: "none", md: "flex" }} px="4">
                        Search Partners
                      </Text>
                    </Button>
                  </Tooltip>
                  <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                      <DrawerHeader borderBottomWidth="1px">
                        Search Partners
                      </DrawerHeader>
                      <DrawerBody>
                        <Box display="flex" pb={2}>
                          <Input
                            placeholder="Search by name or email"
                            mr={2}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                          <ChatLoading />
                        ) : (
                          searchResult?.map((u) => (
                            <UserListItems
                              key={u.id}
                              u={u}
                              handleFunction={() => accessChat(u.id)}
                            />
                          ))
                        )}

                        {loadingChat && <Spinner ml="auto" display="flex" />}
                      </DrawerBody>
                    </DrawerContent>
                  </Drawer>
                  {user && <MyChats fetchAgain={fetchAgain} />}
                </Box>
                {user && (
                  <ChatBox
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                )}
              </div>
            </Box>
          </div>
        </Box>
      ) : (
        navigate("/404")
      )}
    </div>
  );
}

export default ChatPage;
