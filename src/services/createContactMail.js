require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = ({ company, description }) => {
  return {
    from: `"${company.nome}" <${company.email}>`,
    to: process.env.MAIL_SERVICE_USER_AUTH,
    cc: company.email,
    subject: `Contato - ${company.nome}`,
    text: description,
  };
};
