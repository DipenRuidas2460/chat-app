const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.TOKEN_secret_key;
const bcrypt = require("bcrypt");

const validateToken = (token) => {
  try {
    if (!token) {
      return false;
    }
    token = token.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

const generateString = (length) => {
  const characters = "0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return `TX${result}`;
};

// Function to encrypt a password
async function encryptPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Function to compare a password with its encrypted version
async function checkPassword(inputPassword, encryptedPassword) {
  const passwordMatch = await bcrypt.compare(inputPassword, encryptedPassword);
  return passwordMatch;
}

function convertToArray(inputArray) {
  if (!Array.isArray(inputArray)) {
    return [];
  }

  const resultArray = [];

  for (let i = 0; i < inputArray.length; i++) {
    const values = inputArray[i].split(",").map((value) => value.trim());
    resultArray.push(...values);
  }

  return resultArray;
}

function getUserbyToken(req) {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ status: "error", error: "unauthorized" });
  }
  token = token.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, secretKey);

    return (req.person = decodedToken);
  } catch (error) {
    return res.status(401).json({ status: "error", error: "unauthorized" });
  }
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

module.exports = {
  validateToken,
  generateString,
  encryptPassword,
  checkPassword,
  convertToArray,
  getUserbyToken,
  generateRandomString,
};