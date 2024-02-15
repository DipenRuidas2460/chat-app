const fs = require("fs");
const path = require("path");

const getFiles = async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = "../uploads/files/" + fileName;
  const profFilePath = path.join(__dirname, filePath);
  const file = await fs.readFileSync(profFilePath);
  res.write(file);
  res.end();
};

const getProfileImage = async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = "../uploads/profileImage/" + fileName;
  const profileImagePath = path.join(__dirname, filePath);
  const file = await fs.readFileSync(profileImagePath);
  res.write(file);
  res.end();
};

module.exports = { getFiles, getProfileImage };
