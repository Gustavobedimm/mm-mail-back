const nodemailer = require("nodemailer");
const fs = require('fs');

module.exports = (nome,doc,email,emailcc,origem,destino,valor,var64) => {

    function teste(){

    }
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
        //text: "Nome : "+nome+ " Doc : "+doc + "Por favor não responder este E-mail."+"Origem: "+origem+"Destino: "+destino+ "Valor: R$"+valor,// plain text body
        html: `<b>Cliente : ${nome}</b>
                <p>Documento : ${doc}</p>
                <p>Email : ${email}</p>
                <p>Origem : ${origem}</p>
                <p>Destino : ${destino}</p>
                <p>Valor : ${valor}</p>
                  `, // html body
                  attachments : [{   // encoded string as an attachment
                    filename: 'orcamento.txt',
                    content: var64,
                    encoding: 'base64'
                }],
      };
      return new Promise((resolve, reject) => {
        console.log("teste");
        transporter.sendMail(info)
        .then(response => {
            return resolve(response);
        })
        .catch(error => {
            return reject(error);
        })
      })
}



  
