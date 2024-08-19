const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const app = express();

app.use(cors("*"));
app.use(express.json());

app.post("/send-mail-odonto", async (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const valorTotal = req.body.valorTotal;
  //const obs = req.body.obs;
  const listaProcedimentos = req.body.procedimentos;
  const envia = req.body.enviaEmail;
  const empresaNome = req.body.empresaNome;
  //const empresaCelular = req.body.empresaCelular;
  //const empresaTelefone = req.body.empresaTelefone;
  //const empresaCnpj = req.body.empresaCnpj;
  const empresaEmail = req.body.empresaEmail;
  const empresaEndereco = req.body.empresaEndereco;
  //const empresaEstado = req.body.empresaEstado;
  //const empresaCidade = req.body.empresaCidade;
  //const empresaMensagem = req.body.empresaMensagem;
  //const empresaCodigo = req.body.empresaCodigo;
  //const empresaImagem = req.body.empresaImagem;
  const empresaResponsavel = req.body.empresaResponsavel;
  //const empresaSite = req.body.empresaSite;

  //const imageUrl = "https://i0.wp.com/www.cloudia.com.br/wp-content/uploads/odontograma.jpg?fit=1024%2C538&ssl=1";
  //const imageUrlData = await fetch(imageUrl);

  //const buffer = await imageUrlData.arrayBuffer();
  //const stringifiedBuffer = Buffer.from(buffer).toString("base64");
  //const contentType = imageUrlData.headers.get("content-type");
  //const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

  //montaPDF
  var docpdf = new PDFDocument({ autoFirstPage: false });
  docpdf.addPage({
    margins: { top: 0, left: 0, right: 0, bottom: 0 },
    size: 'A4',
  });
  const date = new Date();
  const dia = date.getDate();
  const diaFormatado = dia.toString().padStart(2, "0");
  const mes = date.getMonth() + 1;
  const mesFormatado = mes.toString().padStart(2, "0");
  const ano = date.getFullYear();
  //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH
  //quadrado logo
  //------------------------------------------------------------
  let left = 50;
  let top = 50;
  //docpdf.fontSize(15);
  //docpdf.font("Helvetica-Bold").text("Orçamento", left, top , {align: 'center'});
  docpdf.fontSize(13);
  //top = top + 50;
  
  docpdf.font("Helvetica-Bold").text(empresaNome, left, top);
  docpdf.fontSize(11);
  top = top + 14;
  docpdf.font("Helvetica").text("Cirurgiã-Dentista " + empresaResponsavel + " CRO | 36799", left, top);
  top = top + 40;

  docpdf.font("Helvetica-Bold").text("Paciente : ", left, top);
  docpdf.font("Helvetica").text(nome, left + 60, top);
  top = top + 14;
  docpdf.font("Helvetica-Bold").text("Celular : ", left, top);
  docpdf.font("Helvetica").text("45 999951445", left + 60, top);
  
  top = top + 40;
  //docpdf.font("Helvetica-Bold").text("Endereço : " , left, top);
  //docpdf.font("Helvetica").text( empresaEndereco, left + 60, top);
  //top = top + 12;
  //docpdf.font("Helvetica-Bold").text("Email : " , left, top);
  //docpdf.font("Helvetica").text( empresaEmail, left + 40, top);
  //top = top + 30;
  docpdf.rect(40, top -13 , 520, 35).fillAndStroke("#36C2CE", "#fff");
  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");
  docpdf.font("Helvetica-Bold").text("Procedimentos ", left, top);
  docpdf.font("Helvetica-Bold").text("Valor ", left + 470, top);
  
  top = top + 35;

  //margin left - margin top - width - height
  listaProcedimentos.map((doc) => {
    //docpdf.rect(65, top, 485, 35).fillAndStroke("#E9ECEF", "#fff");
    //docpdf.fillColor("#000");
    //docpdf.strokeColor("#000");
    
    //docpdf.font("Helvetica-Bold").text("Procedimento : ", left, top);
    docpdf.font("Helvetica").text( doc.label, left, top);
    //docpdf.font("Helvetica").text(doc.valor, left + 460, top);
    docpdf.text(doc.valor,left + 450,top, {
      width: 50,
      align: 'right'
     });
     
    top = top + 12;
    //docpdf.fontSize(9);
    docpdf.font("Helvetica").text("Dente : 15", left, top);
    //docpdf.fontSize(11);
    top = top + 15;
    //docpdf.rect(40,top,535, .5).stroke();
    docpdf.lineWidth(.5);
    docpdf.lineCap('butt')
    .moveTo(40, top)
    .lineTo(560, top)
    .stroke();
    top = top + 10;
  });
  top = top + 30;
  docpdf.rect(left + 350, top -13 , 160, 35).fillAndStroke("#36C2CE", "#fff");
  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");
  docpdf
    .font("Helvetica-Bold")
    .text("TOTAL : R$ " , left + 365, top);
    docpdf.text(valorTotal,left + 450,top, {
      width: 50,
      align: 'right'
     });

  //docpdf.rect(65, mt, 485, 35).fillAndStroke("#E9ECEF", "#fff");
  docpdf.font("Helvetica").text(diaFormatado+"/"+mesFormatado+"/"+ano,  480, 705);
  //docpdf.rect(40, 40, 530, 710).stroke("#E9ECEF");
  //if(imageUrlData.ok){
  //docpdf.image(imageBase64, { width: 300, height: 200 });
  //docpdf.image(imageBase64, {
  //  fit: [460, 200], align: 'center', valign:
  //    'center'
  //}).stroke();

  //}

  //------------------------------------------------------------
  docpdf.end();
  const data = docpdf.read();
  const pdf64 = data.toString("base64");

  if (envia) {
    require("./mailService")(
      empresaNome,
      nome,
      "",
      email,
      "",
      "",
      "",
      valorTotal,
      pdf64
    )
      .then((response) => res.status(200).json({ pdfBase64: pdf64 }))
      .catch((error) => res.status(400).json(error));
  } else {
    return res.status(200).json({ pdfBase64: pdf64 });
  }
});

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
  const diaFormatado = dia.toString().padStart(2, "0");
  const mes = date.getMonth() + 1;
  const mesFormatado = mes.toString().padStart(2, "0");
  const ano = date.getFullYear();

  const hora = date.getHours();
  const horaFormatado = hora.toString().padStart(2, "0");
  const minutos = date.getMinutes();
  const minutosFormatado = minutos.toString().padStart(2, "0");
  const segundos = date.getSeconds();
  const segundosFormatado = segundos.toString().padStart(2, "0");

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
  const imageUrl = empresaImagem;
  //const imageUrl = "https://live.staticflickr.com/65535/53907540152_131cb7eecb_m.jpg";
  const imageUrlData = await fetch(imageUrl);

  const buffer = await imageUrlData.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer).toString("base64");
  const contentType = imageUrlData.headers.get("content-type");
  const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

  var docpdf = new PDFDocument();
  //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH
  //quadrado logo
  docpdf.rect(40, 40, 130, 50).stroke();
  if (imageUrlData.ok) {
    docpdf.image(imageBase64, 41, 41, { width: 128, height: 48 });
  }
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
  docpdf.font("Helvetica-Bold").text("ORÇAMENTO", 465, 50);
  docpdf.fontSize(10);
  docpdf
    .font("Helvetica")
    .text(
      "N° " + horaFormatado + minutosFormatado + segundosFormatado,
      475,
      65
    );
  docpdf
    .font("Helvetica")
    .text(diaFormatado + "/" + mesFormatado + "/" + ano, 475, 74);
  docpdf.fontSize(11);
  docpdf.rect(40, 630, 530, 25).stroke();
  docpdf.rect(40, 655, 530, 50).stroke();

  docpdf.fontSize(11);
  docpdf.fontSize(10);
  docpdf.rect(40, 110, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 137, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 211, 530, 18).fillAndStroke("#ddd", "#fff");
  docpdf.rect(40, 366, 530, 18).fillAndStroke("#ddd", "#fff");

  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");

  docpdf.font("Helvetica-Bold").text("ORÇAMENTO", 40, 115, { align: "center" });
  docpdf
    .font("Helvetica-Bold")
    .text("DADOS DO CLIENTE", 40, 142, { align: "center" });
  docpdf
    .font("Helvetica-Bold")
    .text("RELAÇÃO DOS SERVIÇOS", 40, 216, { align: "center" });
  docpdf
    .font("Helvetica-Bold")
    .text("OBSERVAÇÕES", 40, 371, { align: "center" });

  docpdf.fontSize(10);
  docpdf.font("Helvetica");

  docpdf.fontSize(10);
  docpdf.font("Helvetica-Bold").text("Nome : ", 40, 164);
  docpdf.font("Helvetica").text(nome, 80, 164);
  docpdf.font("Helvetica-Bold").text("E-mail : ", 40, 178);
  docpdf.font("Helvetica").text(email, 80, 178);
  docpdf.font("Helvetica-Bold").text("Doc.   : ", 40, 192);
  docpdf.font("Helvetica").text("Não informado", 80, 192);

  docpdf.list(myArrayOfItems2, 40, 240);
  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  docpdf.fontSize(13);
  docpdf.font("Helvetica-Bold").text("TOTAL : R$ " + valor, 60, 640);
  docpdf.fontSize(10);
  docpdf.font("Helvetica");
  docpdf.fontSize(11);
  docpdf.font("Helvetica");
  docpdf.fontSize(10);
  docpdf.text("Orçamento válido por 15 dias, após a data de emissão.", 40, 394);
  docpdf.text(obs, 40, 414);
  docpdf.fontSize(11);
  docpdf.moveDown(7);
  docpdf.text("_________________________________", 70, 675);
  docpdf.text(empresaNome + " - " + empresaCnpj);
  docpdf.moveDown(3);
  docpdf.text("_________________________________", 330, 675);
  docpdf.text(nome + " - Não informado");

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
