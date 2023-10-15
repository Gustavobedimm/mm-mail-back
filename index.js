const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors('*'));
app.use(express.json());

app.post("/send-mail", async (req,res) => {
    require('./mailService')()
    .then(response => res.json(response))
    .catch(error => res.status(500).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})