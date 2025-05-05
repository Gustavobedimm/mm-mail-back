require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = ({ company, description }) => {
  return {
    from: `"${company.nome}" <${process.env.MAIL_SERVICE_USER_AUTH}>`,
    to: process.env.SUPPORT_EMAIL,
    cc: company.email,
    subject: `Contato - ${company.nome}`,
    text: description,
  };
};
