const nodemailer = require("nodemailer");

module.exports = () => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: 'mudancasmazutti@gmail.com',
          pass: 'pjri hows xcwl iqzr'
        }
      });
      const info =  {
        from: '"Mudanças Mazutti" <central.defretes@hotmail.com>', // sender address
        to: "gustavo_bmazutti@hotmail.com", // list of receivers
        subject: "Orçamento", // Subject line
        text: "Por favor não responder este E-mail." // plain text body
        //html: "<b>Hello world?</b>", // html body
      };
      return new Promise((resolve, reject) => {
        transporter.sendMail(info)
        .then(response => {
            transporter.close();
            return resolve(response);
        })
        .catch(error => {
            transporter.close();
            return reject(error);
        })
      })
}



  
