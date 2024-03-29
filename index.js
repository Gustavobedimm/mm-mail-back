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

//PEGANDO DADOS DA REQUISICAO ENVIADA PELO FORMULARIO
  const nome = req.body.nome;
  const doc = req.body.doc;
  const email = req.body.email;
  const emailcc = req.body.emailcc;
  const origem = req.body.origem;
  const destino = req.body.destino;
  const valor = req.body.valor;
  const obs = req.body.obs;
  const envia = req.body.enviaEmail;
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
  const empresaNome = req.body.empresaNome;
  const empresaCelular= req.body.empresaCelular;
  const empresaTelefone= req.body.empresaTelefone;
  const empresaCnpj= req.body.empresaCnpj;
  const empresaEmail= req.body.empresaEmail;
  const empresaEndereco= req.body.empresaEndereco;
  const empresaEstado= req.body.empresaEstado; 
  const empresaCidade= req.body.empresaCidade; 
  const empresaMensagem= req.body.empresaMensagem;
  const empresaCodigo= req.body.empresaCodigo; 
  const empresaImagem= req.body.empresaImagem;
  const empresaResponsavel=req.body.empresaResponsavel;
  const empresaSite = req.body.empresaSite;
  //const imagemBase64 = req.body.imagemBase64;

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
  if(cb9 === true){
    myArrayOfItems2.push("SERVICO DE PERSONAL ORGANIZER");
  }
  myArrayOfItems2.push("TRANSPORTE DE "+origem+" PARA "+ destino);


    var docpdf = new PDFDocument();
    //CORPO PDF----------------------------------------------------
    //docpdf.image(imagemBase64, 320, 15, {fit: [100, 100]})
 //.rect(320, 15, 100, 100)
 //.stroke()
 //.text('Fit', 320, 0);

    //docpdf.fontSize(11);
    //docpdf.text(empresaNome+" - " + empresaCnpj + " - "+empresaEndereco+","+empresaCidade+"-"+empresaEstado , { align: 'right'});
    //docpdf.text(empresaResponsavel+" - "+empresaCelular +" - "+empresaEmail , { align: 'right'});
    //docpdf.text(empresaSite , { align: 'right'});
    //docpdf.moveDown(2);
    //docpdf.fontSize(20);
    //docpdf.text("ORÇAMENTO", { align: 'center'});
    //docpdf.moveDown(2);
    //docpdf.fontSize(11);
    //docpdf.text("Cliente : " +nome);
    //docpdf.text("E-mail  : " +email);

    //docpdf.moveDown(1);
    //docpdf.text("Orçamento referente a prestação dos serviços a baixo  : ");
    //docpdf.moveDown(1);
    //docpdf.list(myArrayOfItems2);
    //docpdf.moveDown(1);
    //docpdf.image(__dirname+'/teste.png', {width: 150, height: 150});
    //docpdf.text("Observações: " + obs);
    //docpdf.moveDown();
    //docpdf.font('Helvetica-Bold').text("O investimento necessário será de R$ : R$ "+ valor);
    //docpdf.font('Helvetica');
    //docpdf.moveDown(2);
    //docpdf.text(empresaMensagem);
    
    //docpdf.moveDown(3);
    //docpdf.text("________________________________________");
    //docpdf.text(empresaNome+" - "+empresaCnpj);
    //docpdf.moveDown(2);
    //docpdf.text("________________________________________");
    //docpdf.text(nome);
    //docpdf.moveDown(3);
    //docpdf.text(empresaCidade+"-"+empresaEstado +" , "+ StringdataAtual);
   //novo MODELO
   docpdf.fontSize(20);
   docpdf.text("ORÇAMENTO", { align: "center" });
   docpdf.fontSize(11);
   docpdf.rect(70, 119, 480, 15).stroke();
   docpdf.rect(70, 134, 240, 15).stroke();
   docpdf.rect(310, 134, 240, 15).stroke();
   docpdf.rect(70, 149, 480, 15).stroke();
   docpdf.rect(70, 164, 240, 15).stroke();
   docpdf.rect(310, 164, 240, 15).stroke();
   docpdf.rect(70, 179, 480, 15).stroke();
   docpdf.fontSize(11);
   docpdf.font("Helvetica-Bold").text("DADOS DA EMPRESA", 75, 123);
   docpdf.fontSize(10);
   docpdf.font("Helvetica");
   docpdf.text("Empresa : " + empresaNome, 75, 138);
   docpdf.text("CNPJ : "+empresaCnpj, 315, 138);
   docpdf.text("Endereço : "+empresaEndereco, 75, 153);
   docpdf.text("Responsavel : "+empresaResponsavel, 75, 168);
   docpdf.text("Celular : " +empresaCelular, 315, 168);
   docpdf.fontSize(11);
   docpdf.font("Helvetica-Bold").text("DADOS DO CLIENTE", 75, 183);
   docpdf.fontSize(10);
   docpdf.font("Helvetica");
   docpdf.rect(70, 194, 480, 15).stroke();
   docpdf.rect(70, 209, 480, 15).stroke();
   docpdf.rect(70, 224, 480, 15).stroke();
   docpdf.fontSize(11);
   docpdf.text("Nome : "+nome, 75, 198);
   docpdf.text("E-mail : "+email, 75, 214);
   docpdf.text("Documento : Não informado", 75, 228);
   docpdf.list(myArrayOfItems2, 75, 275);
   docpdf.font("Helvetica-Bold").text("SERVIÇOS", 270, 258);
   docpdf.fontSize(10);
  docpdf.font("Helvetica");
  docpdf.rect(70, 254, 480, 150).stroke();
  docpdf.rect(70, 254, 480, 15).stroke();
  docpdf.rect(370, 419, 180, 15).stroke();
  docpdf.fontSize(11);
  docpdf.font("Helvetica-Bold").text("VALOR TOTAL : R$ "+valor, 380, 423);
  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  docpdf.rect(70, 449, 480, 100).stroke();
  docpdf.rect(70, 449, 480, 15).stroke();
  docpdf.fontSize(11);
  docpdf.font("Helvetica-Bold").text("OBSERVAÇÕES", 270, 453);
  docpdf.font("Helvetica");
  docpdf.fontSize(10);
  docpdf.text("Orçamento válido por 15 dias, após a data de emissão.", 75, 535);
  docpdf.fontSize(11);
  docpdf.moveDown(5);
  docpdf.text("________________________________________________________");
  docpdf.text(empresaNome+" - "+empresaCidade+"-"+empresaEstado +" , "+ StringdataAtual);

    //------------------------------------------------------------
    docpdf.end();
    const data = docpdf.read();
    const pdf64 = data.toString("base64");

  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
  if(envia){
    require('./mailService')(empresaNome,nome,doc,email,emailcc,origem,destino,valor,pdf64)
    .then(response => res.status(200).json({pdfBase64:pdf64}))
    .catch(error => res.status(400).json(error));
  }else{
    return res.status(200).json({pdfBase64:pdf64});
  }
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})