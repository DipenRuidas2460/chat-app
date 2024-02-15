const express = require("express");
const router = express.Router();

const {
  login,
  addUser,
  forgetPass,
  fpUpdatePass,
  logOut,
  updateUser,
  getUserById,
  updatePassword,
  getAllUsersByQuery,
} = require("../controllers/userController");

const {
  allMessages,
  sendMessage,
} = require("../controllers/messageController");

const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatController");

const { validateTokenMiddleware } = require("../middleware/auth");

const { getFiles, getProfileImage } = require("../helper/fileHelper");

// -------------------- User Profile Route ----------------------------------------------------------------------------------

router.post("/customer/register", addUser);
router.get("/assets/files/:fileName", getFiles);
router.get("/assets/image/:fileName", getProfileImage);
router.post("/customer/login", login);
router.get("/customer/logout", logOut);
router.post("/customer/forgotpass", forgetPass);
router.post("/customer/resetpass", fpUpdatePass);
router.put("/customer/update", validateTokenMiddleware, updateUser);
router.patch(
  "/customer/updatePassword",
  validateTokenMiddleware,
  updatePassword
);
router.get("/customer/getUserById", validateTokenMiddleware, getUserById);
router.get(
  "/customer/getAllUsers",
  validateTokenMiddleware,
  getAllUsersByQuery
);

// --------------------- Chat Routes ----------------------------------------------------------------------------------------------

router.post("/chat", validateTokenMiddleware, accessChat);
router.get("/chat", validateTokenMiddleware, fetchChats);
router.post("/group", validateTokenMiddleware, createGroupChat);
router.put("/rename", validateTokenMiddleware, renameGroup);
router.put("/groupremove", validateTokenMiddleware, removeFromGroup);
router.put("/groupadd", validateTokenMiddleware, addToGroup);

// --------------------- Message Routes -------------------------------------------------------------------------------------------

router.post("/message", validateTokenMiddleware, sendMessage);
router.get("/message/:chatId", validateTokenMiddleware, allMessages);

module.exports = router;
