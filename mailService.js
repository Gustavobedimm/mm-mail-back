const nodemailer = require("nodemailer");
const { jsPDF } = require("jspdf");

module.exports = (nome,doc,email,origem,destino,valor) => {

    const doc = new jsPDF();
    doc.text("Bem vindo", 10, 10);
    doc.save('/temp/orcamento.pdf');
  

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
        to: email, // list of receivers
        subject: "Orçamento ", // Subject line
        text: "Nome : "+nome+ " Doc : "+doc + "Por favor não responder este E-mail."+"Origem: "+origem+"Destino: "+destino+ "Valor: R$"+valor,// plain text body
        //html: "<b>Hello world?</b>", // html body
        attachments: [{
          filename:'orcamento.pdf', 
          contentType: 'application/pdf',
          path: '/temp/'
      }]
      };
      return new Promise((resolve, reject) => {
        transporter.sendMail(info)
        .then(response => {
            return resolve(response);
        })
        .catch(error => {
            return reject(error);
        })
      })
}



  
