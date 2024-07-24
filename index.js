const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const app = express();

app.use(cors("*"));
app.use(express.json());

app.post("/send-mail", async (req, res) => {
  //monta data
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
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
  const empresaCelular = req.body.empresaCelular;
  const empresaTelefone = req.body.empresaTelefone;
  const empresaCnpj = req.body.empresaCnpj;
  const empresaEmail = req.body.empresaEmail;
  const empresaEndereco = req.body.empresaEndereco;
  const empresaEstado = req.body.empresaEstado;
  const empresaCidade = req.body.empresaCidade;
  const empresaMensagem = req.body.empresaMensagem;
  const empresaCodigo = req.body.empresaCodigo;
  const empresaImagem = req.body.empresaImagem;
  const empresaResponsavel = req.body.empresaResponsavel;
  const empresaSite = req.body.empresaSite;

  let myArrayOfItems2 = [];
  if (cb1 === true) {
    myArrayOfItems2.push("CARGA");
  }
  if (cb2 === true) {
    myArrayOfItems2.push("DESCARGA");
  }
  if (cb3 === true) {
    myArrayOfItems2.push("AJUDANTES");
  }
  if (cb4 === true) {
    myArrayOfItems2.push("MATERIAL PARA EMBALAGEM");
  }
  if (cb5 === true) {
    myArrayOfItems2.push("EMBALAGEM DE LOUÇAS");
  }
  if (cb6 === true) {
    myArrayOfItems2.push("EMBALAGEM DE MÓVEIS");
  }
  if (cb7 === true) {
    myArrayOfItems2.push("DESMONTAGEM DE MÓVEIS");
  }
  if (cb8 === true) {
    myArrayOfItems2.push("MONTAGEM DE MÓVEIS");
  }
  if (cb9 === true) {
    myArrayOfItems2.push("SERVICO DE PERSONAL ORGANIZER");
  }
  myArrayOfItems2.push("TRANSPORTE DE " + origem + " PARA " + destino);

  //pega o link da imagem e tranforma em base64
  const imageUrl = "https://scontent-gru2-2.xx.fbcdn.net/v/t39.30808-6/292144575_501011975272755_4032545509857822416_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ZTYQjGBKjAYQ7kNvgGRLYFh&_nc_ht=scontent-gru2-2.xx&oh=00_AYD2gJRkxeFWS_dx3JIMdKzUSf8Y3hz4HeDx1Rb6ocWiIA&oe=66A724C4";
  const imageUrlData = await fetch(imageUrl);
  const buffer = await imageUrlData.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer).toString("base64");
  const contentType = imageUrlData.headers.get("content-type");
  const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

  var docpdf = new PDFDocument();
  //docpdf.fontSize(18);
  //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH
  //quadrado logo
  docpdf.rect(40, 40, 130, 50).stroke();
  docpdf.image(imageBase64, 40, 40, { width: 130, height: 50 });
  //quadrado dados da empresa
  docpdf.rect(170, 40, 270, 50).stroke();
  docpdf.fontSize(15);
  //docpdf.text(empresaNome, 45, 50, { align: "center" });
  docpdf.font("Helvetica-Bold").text(empresaNome, 45, 45, { align: "center" });
  docpdf.fontSize(8);
  docpdf.font("Helvetica").text(empresaEndereco, 45, 60, { align: "center" });
  docpdf.font("Helvetica").text("CASCAVEL - PR", 45, 70, { align: "center" });
  docpdf
    .font("Helvetica")
    .text("CNPJ : " + empresaCnpj, 45, 80, { align: "center" });

  //quadrado numero do orcamento
  docpdf.rect(440, 40, 130, 50).stroke();
  docpdf.fontSize(11);
  docpdf.font("Helvetica-Bold").text("ORÇAMENTO", 450, 50);
  docpdf.fontSize(10);
  docpdf.font("Helvetica").text("N° 113725", 450, 65);
  docpdf.font("Helvetica").text("18/07/2024", 450, 75);

  //docpdf.text("ORÇAMENTO DE SERVIÇO", { align: "right" });
  docpdf.fontSize(11);
  //docpdf.rect(70, 119, 480, 15).stroke();
  //docpdf.rect(70, 134, 240, 15).stroke();
  //docpdf.rect(310, 134, 240, 15).stroke();
  //docpdf.rect(70, 149, 480, 15).stroke();
  //docpdf.rect(70, 164, 240, 15).stroke();
  //docpdf.rect(310, 164, 240, 15).stroke();

  docpdf.fontSize(11);
  //docpdf.font("Helvetica-Bold").text("DADOS DA EMPRESA", 75, 123);
  //docpdf.fontSize(10);
  //docpdf.font("Helvetica");
  //docpdf.text("Empresa : " + empresaNome, 75, 138);
  //docpdf.text("CNPJ : " + empresaCnpj, 315, 138);
  //docpdf.text("Endereço : " + empresaEndereco, 75, 153);
  //docpdf.text("Responsavel : " + empresaResponsavel, 75, 168);
  //docpdf.text("Celular : " + empresaCelular, 315, 168);
  docpdf.fontSize(10);
  //docpdf.font("Helvetica-Bold").text("DADOS DO CLIENTE", 40, 183);
  docpdf.rect(40, 110, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 137, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 211, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 366, 530, 18).fillAndStroke("#ddd", "#fff");

  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");

  docpdf.font("Helvetica-Bold").text("ORÇAMENTO", 40, 115, { align: "center" });
  docpdf.font("Helvetica-Bold").text("DADOS DO CLIENTE", 40, 142, { align: "center" });
  docpdf.font("Helvetica-Bold").text("RELAÇÃO DOS SERVIÇOS", 40, 216, { align: "center" });
  docpdf.font("Helvetica-Bold").text("OBSERVAÇÕES", 40, 371, { align: "center" });

  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  //docpdf.rect(70, 179, 480, 15).stroke();
  //docpdf.rect(70, 194, 480, 15).stroke();
  //docpdf.rect(70, 209, 480, 15).stroke();
  //docpdf.rect(70, 224, 480, 15).stroke();
  docpdf.fontSize(10);
  docpdf.text("Nome : " + nome, 40, 164);
  docpdf.text("E-mail : " + email, 40, 178);
  docpdf.text("Documento : Não informado", 40, 192);

  docpdf.list(myArrayOfItems2, 40, 240);
  //docpdf.font("Helvetica-Bold").text("SERVIÇOS", 270, 258);
  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  //docpdf.rect(40, 254, 530, 150).stroke();
  //docpdf.rect(40, 254, 530, 15).stroke();
  //docpdf.rect(370, 419, 180, 15).stroke();
  docpdf.fontSize(13);
  docpdf.font("Helvetica-Bold").text("TOTAL : R$ " + valor, 40, 454);
  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  //docpdf.rect(40, 449, 530, 100).stroke();
  //docpdf.rect(40, 449, 530, 15).stroke();
  docpdf.fontSize(11);
  //docpdf.font("Helvetica-Bold").text("OBSERVAÇÕES", 270, 453);
  docpdf.font("Helvetica");
  docpdf.fontSize(10);
  docpdf.text("Orçamento válido por 15 dias, após a data de emissão.", 40, 394);
  docpdf.text(obs, 40, 414);
  docpdf.fontSize(11);
  docpdf.moveDown(7);
  docpdf.text("_________________________________");
  docpdf.text(empresaNome +" - " + empresaCnpj);
  docpdf.moveDown(3);
  docpdf.text("_________________________________");
  docpdf.text( nome);

  //------------------------------------------------------------
  docpdf.end();
  const data = docpdf.read();
  const pdf64 = data.toString("base64");

  //ENVIA EMAIL, COM OS DADOS DA REQUISICAO
  if (envia) {
    require("./mailService")(
      empresaNome,
      nome,
      doc,
      email,
      emailcc,
      origem,
      destino,
      valor,
      pdf64
    )
      .then((response) => res.status(200).json({ pdfBase64: pdf64 }))
      .catch((error) => res.status(400).json(error));
  } else {
    return res.status(200).json({ pdfBase64: pdf64 });
  }
});

app.listen(3000, () => {
  console.log("Servidor Iniciado");
});
