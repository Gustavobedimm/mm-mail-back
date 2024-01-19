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
  const imagemBase64 = req.body.imagemBase64;

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

  //async function fetchImage(src) {
   // const image = await axios
    //    .get(src, {
    //        responseType: 'arraybuffer'
    //    })
   // return image.data;
//}
  var image = new Image();
  image.src = imagemBase64;

//const logo = await fetchImage("https://i.imgur.com/2ff9bM7.png");
//pegar imagem transformar em base 64 salvar na base do cliente e enviar pela requisicao

    var docpdf = new PDFDocument();
    //CORPO PDF----------------------------------------------------
    docpdf.fontSize(11);
    docpdf.text(empresaNome+" - " + empresaCnpj + " - "+empresaEndereco+","+empresaCidade+"-"+empresaEstado , { align: 'right'});
    docpdf.text("Claudinei Mazutti - "+empresaCelular +" - "+empresaEmail , { align: 'right'});
    docpdf.text("www.mudancasmazutti.com.br" , { align: 'right'});
    
    docpdf.moveDown(2);
    docpdf.image(image, 100, 100);
    docpdf.fontSize(20);
    docpdf.text("ORÇAMENTO", { align: 'center'});
    docpdf.moveDown(2);
    docpdf.fontSize(11);
    docpdf.text("Cliente : " +nome);
    docpdf.text("E-mail  : " +email);

    docpdf.moveDown(1);
    docpdf.text("Orçamento referente a prestação dos serviços a baixo  : ");
    docpdf.moveDown(1);
    docpdf.list(myArrayOfItems2);
    docpdf.moveDown(1);
    //docpdf.image(__dirname+'/teste.png', {width: 150, height: 150});
    docpdf.text("Observações: " + obs);
    docpdf.moveDown();
    docpdf.font('Helvetica-Bold').text("O investimento necessário será de R$ : R$ "+ valor);
    docpdf.font('Helvetica');
    docpdf.moveDown(2);
    docpdf.text(empresaMensagem);
    
    docpdf.moveDown(3);
    docpdf.text("________________________________________");
    docpdf.text(empresaNome+" - "+empresaCnpj);
    docpdf.moveDown(2);
    docpdf.text("________________________________________");
    docpdf.text(nome);
    docpdf.moveDown(3);
    docpdf.text(empresaCidade+"-"+empresaEstado +" , "+ StringdataAtual);
    //------------------------------------------------------------
    docpdf.end();
    const data = docpdf.read();
    const pdf64 = data.toString("base64");

  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
  if(envia){
    require('./mailService')(nome,doc,email,emailcc,origem,destino,valor,pdf64)
    .then(response => res.status(200).json({pdfBase64:pdf64}))
    .catch(error => res.status(400).json(error));
  }else{
    return res.status(200).json({pdfBase64:pdf64});
  }
});

app.listen(3000, () => {
    console.log("Servidor Iniciado");
})