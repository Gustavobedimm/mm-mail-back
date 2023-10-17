const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors('*'));
app.use(express.json());

app.post("/send-mail", async (req,res) => {
  const nome = req.body.nome;
  const doc = req.body.doc;
  const email = req.body.email;
  const origem = req.body.origem;
  const destino = req.body.destino;
  const valor = req.body.valor;

  console.log(nome+email)
    require('./mailService')(nome,doc,email,origem,destino,valor)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(400).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})