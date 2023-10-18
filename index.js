const express = require('express');
const cors = require('cors');
const { jsPDF } = require("jspdf");
const Pdfmake = require('pdfmake');
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
  
  //const docPDF = new jsPDF('p', 'pt', 'a4');
    //docPDF.addPage();  
   // docPDF.setFontSize(40);
    //docPDF.text(35, 25, "Paranyan loves jsPDF");
    //var base = docPDF.output('datauristring');

    var fonts = {
      Roboto: {
          normal: 'fonts/roboto/Roboto-Regular.ttf',
          bold: 'fonts/roboto/Roboto-Medium.ttf',
          italics: 'fonts/roboto/Roboto-Italic.ttf',
          bolditalics: 'fonts/roboto/Roboto-MediumItalic.ttf'
      }
  };


    let pdfmake = new Pdfmake(fonts);

    let docDefination = {
        content: [
            'Hello World!'
        ],
    }


    let pdfDoc = pdfmake.createPdfKitDocument(docDefination, {});
    //let pdfDocGenerator = pdfMake.createPdf(docInfo);
    let promiseObject = pdfDoc.getBase64((base64Data) => {
     });
     promiseObject.then(function(result) {
        console.log(result);    //in this console log i have base 64 string
     });



  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
    require('./mailService')(nome,doc,email,emailcc,origem,destino,valor,promiseObject)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(400).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})