const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const app = express();

app.use(cors('*'));
app.use(express.json());

app.post("/send-mail", async (req,res) => {
  //monta data
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const date = new Date();
  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  const ano = date.getFullYear();
  const month = months[date.getMonth()];
  const StringdataAtual = dia + " de " + month + " de " + ano;



//PEGANDO DADOS DA REQUISIÇÃO ENVIADA PELO FORMULARIO
  const nome = req.body.nome;
  const doc = req.body.doc;
  const email = req.body.email;
  const emailcc = req.body.emailcc;
  const origem = req.body.origem;
  const destino = req.body.destino;
  const valor = req.body.valor;
  //const cb0 = req.body.cb0;
  const cb1 = req.body.cb1;
  const cb2 = req.body.cb2;
  const cb3 = req.body.cb3;
  const cb4 = req.body.cb4;
  const cb5 = req.body.cb5;
  const cb6 = req.body.cb6;
  const cb7 = req.body.cb7;
  const cb8 = req.body.cb8;
  const cb9 = req.body.cb9;
  let myArrayOfItems2 = [];
  if(cb1 === true){
    myArrayOfItems2.push("CARGA");
  }
  if(cb2 === true){
    myArrayOfItems2.push("DESCARGA");
  }
  if(cb3 === true){
    myArrayOfItems2.push("AJUDANTES");
  }
  if(cb4 === true){
    myArrayOfItems2.push("MATERIAL PARA EMBALAGEM");
  } 
  if(cb5 === true){
    myArrayOfItems2.push("EMBALAGEM DE LOUCAS");
  }
  if(cb6 === true){
    myArrayOfItems2.push("EMBALAGEM DE MOVEIS");
  }
  if(cb7 === true){
    myArrayOfItems2.push("DESMONTAGEM DE MOVEIS");
  }
  if(cb8 === true){
    myArrayOfItems2.push("MONTAGEM DE MOVEIS");
  }
  if(cb8 === true){
    myArrayOfItems2.push("SERVICO DE PERSONAL ORGANIZER");
  }
  myArrayOfItems2.push("TRANSPORTE DE "+origem+" PARA "+ destino);

  //MONTAR O PDF DO ORÇAMENTO
    var docpdf = new PDFDocument();
    //CORPO PDF----------------------------------------------------
    const pathTotal = require('path');
    const path = '';
    path.dirname(pathTotal);
    docpdf.image(pathTotal+'/images/mazutti.png', 0, 15, {width: 300})
   .text('Proportional to width', 0, 0);
    docpdf.fontSize(11);
    docpdf.text("Mudaças Mazutti ME - 01.367.190/0001-42" , { align: 'right'});
    docpdf.text("Rua Parecis 1699, Cascavel-PR" , { align: 'right'});
    docpdf.text("Claudinei Mazutti - 45 99971-7983" , { align: 'right'});
    docpdf.text("www.mudancasmazutti.com.br" , { align: 'right'});
    
    docpdf.moveDown(2);
    docpdf.fontSize(20);
    docpdf.text("ORÇAMENTO", { align: 'center'});
    docpdf.moveDown(2);
    docpdf.fontSize(11);
    docpdf.text("Cliente : " +nome);
    docpdf.text("E-mail  : " +email);

    docpdf.moveDown(2);
    docpdf.text("Orçamento referente a prestação dos serviços a baixo  : ");
    docpdf.moveDown(1);
    docpdf.list(myArrayOfItems2);
    //docpdf.image(__dirname+'/teste.png', {width: 150, height: 150});
    docpdf.moveDown();
    docpdf.font('Helvetica-Bold').text("O investimento necessário será de R$ : R$ "+ valor);
    docpdf.font('Helvetica');
    docpdf.moveDown(2);
    docpdf.text("Nossa empresa atua no mercado de transportes a mais de 18 anos, buscando sempre a exelência no atendimento e na prestação de serviços aos nossos clientes. Transportando com qualidade o que é importante para você.");
    
    docpdf.moveDown(3);
    docpdf.text("________________________________________");
    docpdf.text("Mudanças Mazutti - 01.367.190/0001-42");
    docpdf.moveDown(2);
    docpdf.text("________________________________________");
    docpdf.text(nome);
    docpdf.moveDown(3);
    docpdf.text(StringdataAtual + ", Cascavel-PR");
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