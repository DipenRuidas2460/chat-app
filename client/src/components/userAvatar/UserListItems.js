import { Avatar, Box, Text } from "@chakra-ui/react";
import React from "react";
import config from "../../config/config";

function UserListItems({ u, handleFunction }) {
  console.log("userlistItem:-", u);
  const host = config.BCKHOST;
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={`${u?.firstName} ${u?.lastName}`}
        src={u?.photo != null
          ? `${host}/assets/image/${u.photo}`
          : ""}
      />
      <Box>
        <Text>{`${u.firstName} ${u.lastName}`}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {u.email}
        </Text>
      </Box>
    </Box>
  );
}

export default UserListItems;
