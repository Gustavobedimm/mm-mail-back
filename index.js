
const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'mudancasmazutti@gmail.com',
      pass: 'pjri hows xcwl iqzr'
    }
  });

  async function enviaEmail() {
    const info = await transporter.sendMail({
      from: '"Mudanças Mazutti" <central.defretes@hotmail.com>', // sender address
      to: "gustavo_bmazutti@hotmail.com", // list of receivers
      subject: "Orçamento", // Subject line
      text: "Por favor não responder este E-mail." // plain text body
      //html: "<b>Hello world?</b>", // html body
    });
}
app.post("/send-mail", async (req,res) => {
    try{
      enviaEmail();
      return res.json({
        erro:false,
        mensagem: "Email enviado com sucesso"
    });
    }catch{
      return res.json({
        erro:true,
        mensagem: "Erro"
    });
    }
    
});

app.listen(PORT, () => {
    console.log("servidor iniciado na porta" + PORT);
})