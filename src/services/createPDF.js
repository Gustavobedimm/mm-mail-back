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
  "createdAt",
  "viewed",
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
        const foundedLabel =
          body.customFields?.find((item) => item.field === key)?.label || key;

        return {
          [foundedLabel]: body.customer[key],
        };
      }

      return null;
    })
    .filter((item) => item);
}

module.exports = async (body) => {
  const extra = getExtraFields(body);
  var docpdf = new PDFDocument({ autoFirstPage: false });

  //vendo se a empresa tem imagem
  //const urlImage = body.company.urlImage;
  //console.log(urlImage);

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

    const txtCliente = "Cliente : ";
    const txtClienteWidth = docpdf.widthOfString(txtCliente);
    const txtDocumento = "Documento : ";
    const txtDocumentoWidth = docpdf.widthOfString(txtDocumento);
    const txtCelular = "Celular : ";
    const txtCelularWidth = docpdf.widthOfString(txtCelular);
    const txtEmail = "Email : ";
    const txtEmailWidth = docpdf.widthOfString(txtEmail);

    //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH

    // DADOS DA EMPRESA

    docpdf.fontSize(18);
    docpdf.font("Times-Bold").text("ORÇAMENTO", left + 380, top);
    docpdf.fontSize(11);
    docpdf
      .font("Times-Roman")
      .text(dia + " de " + month + " de " + ano, left + 300, top + 20, {
        width: 200,
        align: "right",
      });

    if (body.company.urlImage) {
      top = top + 65;

      const imageUrl = body.company.urlImage;
      const imageUrlData = await fetch(imageUrl);
      const buffer = await imageUrlData.arrayBuffer();
      const stringifiedBuffer = Buffer.from(buffer).toString("base64");
      const contentType = imageUrlData.headers.get("content-type");
      const base64Image = `data:${contentType};base64,${stringifiedBuffer}`;
      const cleanBase64Image = base64Image.replace(/^data:image\/\w+;base64,/,"");

      docpdf.image(Buffer.from(cleanBase64Image, "base64"), 50, 50, {
        width: 150,
        height: 50,
      });
    }

    docpdf.fontSize(13);
    docpdf.font("Helvetica-Bold").text(body.company.nome, left, top);
    docpdf.fontSize(11);
    top = top + 14;
    docpdf.font("Helvetica").text(body.company.documento, left, top);

    //ESPAÇAMENTO ENTRE EMPRESA E DADOS DO CLIENTE
    
    //DADOS DO CLIENTE APARECE SOMENTE NA PAGINA 1
    if (actualPage === 1) {
      top = top + 45;
      docpdf.font("Helvetica-Bold").text(txtCliente, left, top);
      docpdf
        .font("Helvetica")
        .text(body.customer.customerName, left + txtClienteWidth, top);
      docpdf.font("Helvetica-Bold").text("Documento: ", left + 300, top);
      docpdf
        .font("Helvetica")
        .text(
          body.customer.customerDocument,
          left + 300 + txtDocumentoWidth,
          top
        );
      top = top + 14;
      docpdf.font("Helvetica-Bold").text(txtCelular, left + 300, top);
      docpdf
        .font("Helvetica")
        .text(
          body.customer.customerCellphone,
          left + 300 + txtCelularWidth,
          top
        );

      docpdf.font("Helvetica-Bold").text(txtEmail, left, top);
      docpdf
        .font("Helvetica")
        .text(body.customer.customerEmail, left + txtEmailWidth, top);

      //LINHA DIVISORIA
      docpdf.fillColor("#6c757d");
      docpdf.strokeColor("#6c757d");
      top = top + 23;
      docpdf.lineWidth(0.5);
      docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();
      docpdf.fillColor("#000");
      docpdf.strokeColor("#000");

      //OBS E CAMPOS PERSONALIZADOS
      extra?.map((doc, index) => {
        top = top + 15;
        const key = Object.keys(doc)[0];
        docpdf.font("Helvetica-Bold").text(`${key}:`, left, top);
        docpdf.font("Helvetica").text(doc[key], left + 100, top);
      });

      top = top + 15;
      docpdf.font("Helvetica-Bold").text(`Observação:`, left, top);
      docpdf.font("Helvetica").text(body.customer.obs, left + 80, top);
    }

    //CABEÇALHO TABELA SERVICOS
    top = top + 30;
    docpdf.rect(40, top, lineWidth, lineHeight).fillAndStroke("#000", "#fff");
    docpdf.fillColor("#FFF");
    docpdf.strokeColor("#FFF");
    docpdf
      .font("Helvetica-Bold")
      .text("Descrição", left, top + (lineHeight - fontSize) / 2);
    docpdf
      .font("Helvetica-Bold")
      .text("Quantidade ", left + 315, top + (lineHeight - fontSize) / 2);
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
        // LINHAS DE SERVICOS
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
          doc.quantity,
          left + 250,
          top + (lineHeight - fontSize) / 2,
          {
            width: 100,
            align: "right",
          }
        );

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

    //TOTALIZADOR VALOR
    if (startIndex + servicesPerPage >= totalServices) {
      top = top + 20;
      docpdf
        .rect(left + 355, top, 155, lineHeight)
        .fillAndStroke("#000", "#fff");
      docpdf.fillColor("#FFF");
      docpdf.strokeColor("#FFF");
      docpdf
        .font("Helvetica-Bold")
        .text("TOTAL : ", left + 365, top + (lineHeight - fontSize) / 2);
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

      //TERMO DE CONDICOES
      docpdf.font("Helvetica-Bold").text("Termos e condições ", left, top);
      docpdf
        .font("Helvetica")
        .text("Orçamento válido por 10 dias.", left, top + 13);
    }
    // ASSINATURA DO CLIENTE

    if (startIndex + servicesPerPage >= totalServices) {
      docpdf.lineWidth(0.5);
      const line = 750;
      docpdf.lineCap("butt").moveTo(300, line).lineTo(555, line).stroke();
      docpdf.font("Helvetica").text(body.company.nome, left + 350, line + 5);
    }
    //RODAPE PRETO ==1 || BRANCO ==2
    let tipoRodape = 1;
    if (tipoRodape === 1) {
      top = top + 30;
      docpdf.rect(-1, 795, 600, 50).fillAndStroke("#000", "#fff");
      docpdf.fillColor("#FFF");
      docpdf.strokeColor("#FFF");
      docpdf.fontSize(9);
      docpdf.font("Helvetica-Bold").text("Dados para contato ", left, 805);
      docpdf.font("Helvetica-Bold").text("Endereço  ", left + 150, 805);
      docpdf.font("Helvetica").text(body.company.email, left, 815);
      docpdf.font("Helvetica").text(body.company.endereco, left + 150, 815);
      docpdf.font("Helvetica").text(body.company.celular, left, 825);
      docpdf
        .font("Helvetica")
        .text(
          body.company.cidade + " - " + body.company.estado,
          left + 150,
          825
        );
    } else {
      docpdf.fillColor("#6c757d");
      docpdf.strokeColor("#6c757d");
      docpdf.lineWidth(0.5);
      docpdf.lineCap("butt").moveTo(40, 780).lineTo(555, 780).stroke();
      docpdf.fillColor("#000");
      docpdf.strokeColor("#000");
      docpdf.fontSize(9);
      docpdf.font("Helvetica-Bold").text("Dados para contato ", left, 795);
      docpdf.font("Helvetica-Bold").text("Endereço  ", left + 150, 795);
      docpdf.font("Helvetica").text(body.company.email, left, 805);
      docpdf.font("Helvetica").text(body.company.endereco, left + 150, 805);
      docpdf.font("Helvetica").text(body.company.celular, left, 815);
      docpdf
        .font("Helvetica")
        .text(
          body.company.cidade + " - " + body.company.estado,
          left + 150,
          815
        );
    }
    //MARCAÇÃO DA PAGINA ATUAL
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
