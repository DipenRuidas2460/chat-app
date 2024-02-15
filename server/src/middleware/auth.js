const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateTokenMiddleware = (req, res, next) => {
  const secretKey = process.env.TOKEN_secret_key;
  let token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", msg: "Not Authorized, Please Login!" });
  }
  token = token.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, secretKey);
    if (decodedToken) {
      req.person = decodedToken;
      req.person.id = decodedToken.id;
      req.person.role = decodedToken.role;
      next();
    } else {
      return res.status(401).json({ status: "error", error: "unauthorized" });
    }
  } catch (error) {
    return res.status(401).json({ status: "error", error: "unauthorized" });
  }
};

module.exports = { validateTokenMiddleware };
