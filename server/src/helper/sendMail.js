const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.emailPassword,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: data.respMail,
      subject: data.subject,
      text: data.text,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error.message);
        return false;
      } else {
        return true;
      }
    });
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = { sendMail };