import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../chatLogic/chatLogics";
import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import config from "../../config/config";
import { Link } from "react-router-dom";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const host = config.BCKHOST;

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m.id + i + 1}>
            {(isSameSender(messages, m, i, user.id) ||
              isLastMessage(messages, i, user.id)) && (
              <Tooltip
                key={m.id + 1}
                label={`${m.sender.firstName} ${m.sender.lastName}`}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={`${m.sender.firstName} ${m.sender.lastName}`}
                  src={
                    m.sender.photo != null
                      ? `${host}/assets/image/${m.sender.photo}`
                      : ""
                  }
                />
              </Tooltip>
            )}

            <span
              key={m.id - 1}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, user.id),
                marginTop: isSameUser(messages, m, i, user.id) ? 5 : 17,
                backgroundColor: `${
                  m.sender.id === user.id ? "#B9F5D0" : "#BEE3F8"
                }`,
                borderRadius: "20px",
                padding: "5px 10px",
                maxWidth: "75%",
              }}
            >
              {
                <div key={i}>
                  {
                    <sup key={i - 1}>
                      {m.createdAt.slice(8, 10) +
                        "." +
                        m.createdAt.slice(5, 7) +
                        "." +
                        m.createdAt.slice(2, 4)}
                    </sup>
                  }
                  {<br />}
                  {m.content && m.allFiles ? (
                    <Box>
                      <Link
                        to={`${host}/assets/files/${m.allFiles}`}
                        target="_blank"
                        style={{ cursor: "pointer" }}
                      >
                        {host}/assets/files/{m.allFiles}
                      </Link>
                      <br />
                      <br />
                      {m.content}
                    </Box>
                  ) : m.content ? (
                    m.content
                  ) : m.allFiles ? (
                    <Link
                      to={`${host}/assets/files/${m.allFiles}`}
                      target="_blank"
                      style={{ cursor: "pointer" }}
                    >
                      {host}/assets/files/{m.allFiles}
                    </Link>
                  ) : (
                    ""
                  )}{" "}
                  {<sub key={i + 1}>{m.createdAt.slice(11, 16)}</sub>}
                </div>
              }
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
