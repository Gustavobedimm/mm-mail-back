const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const app = express();

app.use(cors('*'));
app.use(express.json());

app.post("/send-mail", async (req,res) => {
  //PEGANDO DADOS DA REQUISIÇÃO ENVIADA PELO FORMULARIO
  const nome = req.body.nome;
  const doc = req.body.doc;
  const email = req.body.email;
  const emailcc = req.body.emailcc;
  const origem = req.body.origem;
  const destino = req.body.destino;
  const valor = req.body.valor;
  const cb0 = req.body.cb0;
  const cb1 = req.body.cb1;
  const cb2 = req.body.cb2;
  const cb3 = req.body.cb3;
  const cb4 = req.body.cb4;
  const cb5 = req.body.cb5;
  const cb6 = req.body.cb6;
  const cb7 = req.body.cb7;
  const cb8 = req.body.cb8;
  const cb9 = req.body.cb9;
  const fileContent = "";
  //MONTAR O PDF DO ORÇAMENTO
    var docpdf = new PDFDocument();
    //CORPO PDF----------------------------------------------------
    docpdf.fontSize(20);
    docpdf.text("ORÇAMENTO", { align: 'center'});
    docpdf.moveDown(2);
    docpdf.fontSize(11);
    docpdf.text("Razão Social : Mudaças Mazutti LTDA ");
    docpdf.text("CNPJ : 078.879.987/0001-83");
    docpdf.text("Endereço : Rua Parecis 1699, Cascavel-PR");
    docpdf.text("Responsavel : Claudinei Mazutti");
    docpdf.text("Celular : 45 999951445");
    docpdf.moveDown(2);
    docpdf.text("SERVIÇOS PRESTADOS : ");
    let myArrayOfItems = ['TRANSPORTE', 'CARGA', 'DESCARGA', 'EMBALAGEM'];
    docpdf.list(myArrayOfItems);
    //docpdf.image(__dirname+'/teste.png', {width: 150, height: 150});
    docpdf.moveDown();
    docpdf.text("Valor total so serviço : R$"+ valor);
    
    //------------------------------------------------------------
    docpdf.end();
    const data = docpdf.read();
    const pdf64 = data.toString("base64");

  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
    require('./mailService')(nome,doc,email,emailcc,origem,destino,valor,pdf64)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(400).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})