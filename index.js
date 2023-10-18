const express = require('express');
const cors = require('cors');
const { jsPDF } = require("jspdf");
const Pdfmake = require('pdfmake');
const { Base64Encode } = require('base64-stream');
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
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      },
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      },
      Symbol: {
        normal: 'Symbol'
      },
      ZapfDingbats: {
        normal: 'ZapfDingbats'
      }
    };

    let pdfmake = new Pdfmake(fonts);

    var docDefinition = {
      content: [
        'First paragraph',
        'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines',
      ],
      defaultStyle: {
        font: 'Helvetica'
      }
    };


    let pdfDoc = pdfmake.createPdfKitDocument(docDefinition, {});
    var finalString = ''; // contains the base64 string
    var finalString2 = '';
    var stream = pdfDoc.pipe(new Base64Encode());

    stream.on('data', function(chunk) {
      finalString += chunk;
    });
    stream.on('end', function() {
       //the stream is at its end, so push the resulting base64 string to the response
      finalString2 = finalString;
  });
    
    //let pdfDocGenerator = pdfMake.createPdf(docInfo);
    //let base64;
    //pdfDoc.getBase64((data) => {
    //  base64 = data;
    //});



  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
    require('./mailService')(nome,doc,email,emailcc,origem,destino,valor,finalString)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(400).json(error));
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})