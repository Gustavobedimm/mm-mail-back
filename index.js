const express = require('express');
const cors = require('cors');
const { jsPDF } = require("jspdf");
//const PDFDocument = require('pdfkit');
//const fs = require('fs');
//const pdf = require("html-pdf"); 



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
  const docpdf = new PDFDocument();
  //use the tmp serverless function folder to create the write stream for the pdf
  let writeStream = fs.createWriteStream(`/tmp/orcamento.pdf`);
  docpdf.pipe(writeStream);
  docpdf.text("title");
  docpdf.end();

  writeStream.on('finish', function () {
    //once the doc stream is completed, read the file from the tmp folder
     fileContent = fs.readFileSync(`/orcamento.pdf`);
  });
   // const dataTmp;
   // fs.readFile('/tmp/orcamento.pdf', function(err, data) {
    //  dataTmp = data;
    //};
    //console.log(fileContent);
  //});
  
  const docPDF = new jsPDF('p', 'pt', 'a4');
    docPDF.text("Bem vindo", 10, 10);
    //docPDF.save("orcamento.pdf");
    var base = docPDF.output('datauri');

//const docPDF = new PDFDocument();
  //use the tmp serverless function folder to create the write stream for the pdf
//  let writeStream = fs.createWriteStream("/tmp/orcamento.pdf");
//  docPDF.pipe(writeStream);
//  docPDF.text("teste");
//  docPDF.end();

  //require('./pdfService')();
  
  console.log("Entrando no metodo enviar email")
  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
    require('./mailService')(nome,doc,email,emailcc,origem,destino,valor,base)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(400).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})