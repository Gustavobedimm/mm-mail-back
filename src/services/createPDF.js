const doc = require("pdfkit");
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

  let pages = 1;
  let actualPage = 1;
  const servicesPerPage = 15;
  const totalServices = body.customer.services.length;
  if (totalServices > servicesPerPage) {
    pages = Math.ceil(totalServices / 15);
  }

  for (
    let startIndex = 0;
    startIndex < totalServices;
    startIndex += servicesPerPage
  ) {
    docpdf.addPage({
      margins: { top: 0, left: 0, right: 0, bottom: 0 },
      size: "A4",
    });

    let left = 50;
    let top = 50;
    let lineHeight = 25;
    let lineWidth = 520;
    let fontSize = 11;

    //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH

    // DADOS DA EMPRESA
    docpdf.fontSize(13);
    docpdf.font("Helvetica-Bold").text(body.company.nome, left, top);
    docpdf.fontSize(11);
    docpdf
      .font("Helvetica")
      .text(dia + " de " + month + " de " + ano, left + 370, top);
    top = top + 14;
    docpdf
      .font("Helvetica")
      .text("Documento: " + body.company.documento, left, top);

    //linha divisoria
    top = top + 23;
    docpdf.lineWidth(0.5);
    docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();
    top = top + 15;

    //dados do cliente
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

    //linha divisoria
    top = top + 23;
    docpdf.lineWidth(0.5);
    docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();

    //OBS E CAMPOS PERSONALIZADOS
    extra?.map((doc, index) => {
      top = top + 15;
      const key = Object.keys(doc)[0];
      docpdf.font("Helvetica-Bold").text(`${key}:`, left, top);
      docpdf.font("Helvetica").text(doc[key], left + 80, top);
    });

    top = top + 15;
    docpdf.font("Helvetica-Bold").text(`Observação:`, left, top);
    docpdf.font("Helvetica").text(body.customer.obs, left + 80, top);

    //CABEÇALHO TABELA SERVICOS
    top = top + 30;
    docpdf.rect(40, top, lineWidth, lineHeight).fillAndStroke("#000", "#fff");
    docpdf.fillColor("#FFF");
    docpdf.strokeColor("#FFF");
    docpdf
      .font("Helvetica-Bold")
      .text("Serviços", left, top + (lineHeight - fontSize) / 2);
    docpdf
      .font("Helvetica-Bold")
      .text("Valor ", left + 470, top + (lineHeight - fontSize) / 2);
    docpdf.fillColor("#000");
    docpdf.strokeColor("#000");

    //SERVICOS

    top = top + lineHeight;
    body.customer.services
      .slice(startIndex, startIndex + servicesPerPage)
      .forEach((doc, index) => {
        // Desenhe o retângulo alternado
        if (index % 2 === 1) {
          docpdf
            .rect(40, top, lineWidth, lineHeight)
            .fillAndStroke("#f8f9fa", "#fff");
        } else {
          docpdf
            .rect(40, top, lineWidth, lineHeight)
            .fillAndStroke("#e9ecef", "#fff");
        }

        docpdf.fillColor("#000").strokeColor("#000").fontSize(11);
        docpdf
          .font("Helvetica")
          .text(doc.label, left, top + (lineHeight - fontSize) / 2);

        docpdf.text(
          "R$ " + doc.value,
          left + 400,
          top + (lineHeight - fontSize) / 2,
          {
            width: 100,
            align: "right",
          }
        );

        top = top + lineHeight; // Move para a próxima linha
      });

    //TOTALIZADOR
    if (startIndex + servicesPerPage >= totalServices) {
      top = top + 20;
      docpdf
        .rect(left + 355, top, 155, lineHeight)
        .fillAndStroke("#000", "#fff");
      docpdf.fillColor("#FFF");
      docpdf.strokeColor("#FFF");
      docpdf
        .font("Helvetica-Bold")
        .text("Valor Total: ", left + 365, top + (lineHeight - fontSize) / 2);
      docpdf.text(
        "R$ " + body.customer.totalValue,
        left + 400,
        top + (lineHeight - fontSize) / 2,
        {
          width: 100,
          align: "right",
        }
      );
      docpdf.fillColor("#000");
      docpdf.strokeColor("#000");
    }
    // ASSINATURA DO CLIENTE

    docpdf.lineWidth(0.5);
    const line = 730;

    docpdf.lineCap("butt").moveTo(300, line).lineTo(555, line).stroke();
    docpdf.font("Helvetica").text(body.company.nome, left + 350, line + 5);

    //RODAPE

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
    docpdf
      .font("Helvetica")
      .text("Página " + actualPage + " de " + pages, left + 450, 815);
      actualPage++;
    //------------------------------------------------------------
  }
  docpdf.end();
  const data = docpdf.read();

  return data.toString("base64");
};
