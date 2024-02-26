import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React, { createRef } from "react";
import { ChatState } from "../../context/ChatProvider";
import ProfileMenu from "./ProfileMenu";
import config from "../../config/config";
import { useNavigate } from "react-router-dom";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../chatLogic/chatLogics";

function SideBarDrawer() {
  const { user, notification, setNotification, setSelectedChat } = ChatState();
  const host = config.BCKHOST;
  const navigate = useNavigate();
  const badgeRef = createRef();;

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <div className="sidebar-chat">
        <div
          className="sidebar-chat-parent"
        >
          <Menu>
            <MenuItem
              w="100%"
              fontWeight="600"
              fontSize="20px"
              fontFamily="Montserrat"
              wordBreak="break-word"
              color="#565656"
            >{`${user.firstName} ${user.lastName}`}</MenuItem>
          </Menu>
          <div className="available-text">Available</div>
        </div>
        <div className="profile-photo-icon">
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                ref={badgeRef}
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    setSelectedChat(notif.msg);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.msg.isGroupChat
                    ? `New Message from ${notif.msg.chatName}`
                    : `New Message from ${getSender(user, [
                        notif.msg.chatsender,
                        notif.msg.receive,
                      ])}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={`${user.firstName} ${user.lastName}`}
                src={
                  user.photo != null ? `${host}/assets/image/${user.photo}` : ""
                }
              />
            </MenuButton>
            <MenuList>
              <ProfileMenu user={user}>
                <MenuItem>My Profile</MenuItem>
                <MenuItem onClick={() => handleLogOut()}>LogOut</MenuItem>
              </ProfileMenu>
              <MenuDivider />
              <MenuDivider />
            </MenuList>
          </Menu>
        </div>
      </div>
    </>
  );
}

export default SideBarDrawer;
