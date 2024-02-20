import { Avatar, Box, Text } from "@chakra-ui/react";
import React from "react";
import config from "../../config/config";

function UserListItems({ searchUser, handleFunction }) {
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
        name={`${searchUser?.firstName} ${searchUser?.lastName}`}
        src={searchUser?.photo != null
          ? `${host}/assets/image/${searchUser.photo}`
          : ""}
      />
      <Box>
        <Text>{`${searchUser?.firstName} ${searchUser?.lastName}`}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {searchUser?.email}
        </Text>
      </Box>
    </Box>
  );
}

export default UserListItems;
