require("dotenv").config();
const nodemailer = require("nodemailer");
const budgetTemplate = require("./src/utils/budgetTemplate");

module.exports = (
  empresaNome,
  nome,
  doc,
  email,
  emailcc,
  origem,
  destino,
  valor,
  var64,
  budgetId
) => {
  const EMAIL = process.env.MAIL_SERVICE_USER_AUTH;
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE_HOST,
    port: 587,
    secure: false,
    auth: {
      user: EMAIL,
      pass: process.env.MAIL_SERVICE_USER_PASSWORD,
    },
  });

  const info = {
    from: `"${empresaNome}" <${EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "Orçamento ", // Subject line
    text: `Não responder este E-Mail. 
        Arquivo em anexo.`, // plain text body
    // html: `<img src="${process.env.API_URL}/api/rastreamento-email?budgetId=${budgetId}" width="1" height="1" alt=""/>`,
    html: budgetTemplate({
      nome,
      empresaNome,
      budgetId,
    }),
    attachments: [
      {
        // encoded string as an attachment
        filename: "orcamento.pdf",
        content: var64,
        encoding: "base64",
      },
    ],
  };
  return new Promise((resolve, reject) => {
    transporter
      .sendMail(info)
      .then((response) => {
        return resolve(response);
      })
      .catch((error) => {
        console.log(error);
        return reject(error);
      });
  });
};
