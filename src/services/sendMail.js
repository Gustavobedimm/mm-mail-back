require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_SERVICE_USER_AUTH,
      pass: process.env.MAIL_SERVICE_USER_PASSWORD,
    },
  });

  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((response) => resolve(response))
      .catch((error) => {
        console.log(error);

        return reject(error);
      });
  });
};
