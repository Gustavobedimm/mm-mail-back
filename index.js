const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors('*'));
app.use(express.json());

app.post("/send-mail", async (req,res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  console.log(nome+email)
    require('./mailService')(nome,email)
    .then(response => res.status(400).json(response))
    .catch(error => res.status(500).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})