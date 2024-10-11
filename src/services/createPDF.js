const PDFDocument = require("pdfkit");

const STANDARD_FIELDS = [
  "companyId",
  "services",
  "customerEmail",
  "customerDocument",
  "customerCellphone",
  "customerName",
  "obs",
  "totalValue",
];

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

function getExtraFields(body) {
  const keys = Object.keys(body.customer);

  return keys
    .map((key) => {
      if (!STANDARD_FIELDS.includes(key)) {
        return {
          [key]: body.customer[key],
        };
      }

      return null;
    })
    .filter((item) => item);
}

module.exports = (body) => {
  const extra = getExtraFields(body);
  var docpdf = new PDFDocument({ autoFirstPage: false });

  docpdf.addPage({
    margins: { top: 0, left: 0, right: 0, bottom: 0 },
    size: "A4",
  });

  //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH
  //quadrado logo
  //------------------------------------------------------------
  let left = 50;
  let top = 50;
  //docpdf.fontSize(15);
  //docpdf.font("Helvetica-Bold").text("Orçamento", left, top , {align: 'center'});
  docpdf.fontSize(13);
  //top = top + 50;

  docpdf.font("Helvetica-Bold").text(body.company.nome, left, top);
  docpdf.fontSize(11);
  docpdf
    .font("Helvetica")
    .text(dia + " de " + month + " de " + ano, left + 370, top);

  top = top + 14;
  //docpdf.font("Helvetica").text("Orçamento 123456", left + 370, top);
  // docpdf.font("Helvetica").text("Cirurgiã-Dentista ", left, top);
  // top = top + 14;
  docpdf
    .font("Helvetica")
    .text("Documento: " + body.company.documento, left, top);
  top = top + 23;
  docpdf.lineWidth(0.5);
  docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();
  top = top + 15;

  docpdf.font("Helvetica-Bold").text("Cliente: ", left, top);
  docpdf.font("Helvetica").text(body.customer.customerName, left + 60, top);
  docpdf.font("Helvetica-Bold").text("Documento: ", left + 240, top);
  docpdf
    .font("Helvetica")
    .text(body.customer.customerDocument, left + 310, top);
  top = top + 14;
  docpdf.font("Helvetica-Bold").text("Celular: ", left, top);
  docpdf
    .font("Helvetica")
    .text(body.customer.customerCellphone, left + 60, top);

  top = top + 14;
  docpdf.font("Helvetica-Bold").text("Email: ", left, top);
  docpdf.font("Helvetica").text(body.customer.customerEmail, left + 60, top);

  top = top + 20;

  docpdf.font("Helvetica-Bold").text(`Observação:`, left, top);
  docpdf.font("Helvetica").text(body.customer.obs, left + 80, top);

  extra?.map((doc, index) => {
    top = top + 20;
    const key = Object.keys(doc)[0];

    docpdf.font("Helvetica-Bold").text(`${key}:`, left, top);
    docpdf.font("Helvetica").text(doc[key], left + 80, top);
  });

  top = top + 40;
  //docpdf.font("Helvetica-Bold").text("Endereço : " , left, top);
  //docpdf.font("Helvetica").text( empresaEndereco, left + 60, top);
  //top = top + 12;
  //docpdf.font("Helvetica-Bold").text("Email : " , left, top);
  //docpdf.font("Helvetica").text( empresaEmail, left + 40, top);
  //top = top + 30;
  docpdf.rect(40, top - 13, 520, 35).fillAndStroke("#000", "#fff");
  docpdf.fillColor("#FFF");
  docpdf.strokeColor("#FFF");
  docpdf.font("Helvetica-Bold").text("Serviços", left, top);
  // docpdf.font("Helvetica-Bold").text("Dente ", left + 410, top);
  docpdf.font("Helvetica-Bold").text("Valor ", left + 470, top);
  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");

  top = top + 28;

  //margin left - margin top - width - height

  body.customer.services?.map((doc, index) => {
    if (index % 2 === 1) {
      docpdf.rect(40, top - 6, 520, 35).fillAndStroke("#f8f9fa", "#fff");
    } else {
      docpdf.rect(40, top - 6, 520, 35).fillAndStroke("#e9ecef", "#fff");
    }
    docpdf.fillColor("#000");
    docpdf.strokeColor("#000");
    docpdf.fontSize(12);
    docpdf.font("Helvetica").text(doc.label, left, top + 5);
    docpdf.fontSize(11);
    // docpdf.text(doc.label, left + 410, top + 5, {
    //   width: 30,
    //   align: "right",
    // });
    docpdf.text("R$ " + doc.value, left + 450, top + 5, {
      width: 50,
      align: "right",
    });
    top = top + 10;
    top = top + 20;
    docpdf.fontSize(11);
  });

  top = top + 20;

  docpdf.rect(left + 355, top - 15, 155, 25).fillAndStroke("#000", "#fff");
  docpdf.fillColor("#FFF");
  docpdf.strokeColor("#FFF");
  docpdf.font("Helvetica-Bold").text("Valor Total: ", left + 365, top - 6);
  docpdf.text("R$ " + body.customer.totalValue, left + 400, top - 6, {
    width: 100,
    align: "right",
  });
  docpdf.fillColor("#000");
  docpdf.strokeColor("#000");

  // Complement

  docpdf.lineWidth(0.5);
  const line = 730;

  docpdf.lineCap("butt").moveTo(300, line).lineTo(555, line).stroke();
  docpdf.font("Helvetica").text(body.company.nome, left + 350, line + 5);
  //docpdf.rect(40,top,515, .5).stroke();
  docpdf.lineWidth(0.5);
  docpdf.lineCap("butt").moveTo(40, 780).lineTo(555, 780).stroke();
  docpdf.fontSize(9);
  docpdf.font("Helvetica-Bold").text("Dados para contato ", left, 795);
  docpdf.font("Helvetica-Bold").text("Endereço  ", left + 150, 795);
  docpdf.font("Helvetica").text(body.company.email, left, 805);
  docpdf.font("Helvetica").text(body.company.endereco, left + 150, 805);
  docpdf.font("Helvetica").text(body.company.celular, left, 815);
  docpdf
    .font("Helvetica")
    .text(body.company.cidade + " - " + body.company.estado, left + 150, 815);

  //docpdf.rect(65, mt, 485, 35).fillAndStroke("#E9ECEF", "#fff");
  //docpdf
  //  .font("Helvetica")
  //  .text(diaFormatado + "/" + mesFormatado + "/" + ano, 480, 705);
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

  return data.toString("base64");
};
