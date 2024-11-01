const nodemailer = require("nodemailer");

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
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mudancasmazutti@gmail.com",
      pass: "pjri hows xcwl iqzr",
    },
  });

  const info = {
    from: `"${empresaNome}" <central.defretes@hotmail.com>`, // sender address
    to: email, // list of receivers
    subject: "Orçamento ", // Subject line
    text: `Não responder este E-Mail. 
        Arquivo em anexo.`, // plain text body
    html: `<img src="https://budget-app-sigma-ruby.vercel.app/api/rastreamento-email?budgetId=${budgetId}" width="1" height="1" alt=""/>`,
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
        console.log("nao consegui enviar");
        console.log(error);
        return reject(error);
      });
  });
};
