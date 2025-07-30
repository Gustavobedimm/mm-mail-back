const PDFDocument = require("pdfkit");

const EXCLUDED_FIELDS = [
  "sendedAt",
  "viewedAt",
  "sended",
  "statusBudget",
  "primaryColor",
  "expirationDate",
  "discountPercentage",
  "discountValue",
  "finalValue",
  "id",
];

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

// const date = new Date();
// const dia = date.getDate();
// const mes = date.getMonth() + 1;
// const ano = date.getFullYear();
// const month = months[date.getMonth()];
function formatValues(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getExtraFields(body) {
  const keys = Object.keys(body.customer);

  return keys
    .map((key) => {
      if (!STANDARD_FIELDS.includes(key) && !EXCLUDED_FIELDS.includes(key)) {
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

  const valorDescontoGeralRaw = Number(body.customer.discountValue) || 0;
  const valorDescontoGeral = formatValues(valorDescontoGeralRaw);

  const valorDescontoServicosRaw = body.customer.services.reduce(
    (acc, service) => {
      return acc + (Number(service.discountValue) || 0);
    },
    0
  );
  const valorDescontoServicosFormatted = formatValues(valorDescontoServicosRaw);

  const valorTotalRaw = Number(body.customer.totalValue) || 0;
  const valorTotal = formatValues(valorTotalRaw);

  const valorTotalGeralRaw =
    valorTotalRaw - valorDescontoGeralRaw - valorDescontoServicosRaw;
  const valorTotalGeral = formatValues(valorTotalGeralRaw);
  const discountPercentage = Number(
    (body.customer.discountPercentage || 0).toFixed(2)
  );

  var docpdf = new PDFDocument({ autoFirstPage: false });

  //vendo se a empresa tem imagem
  //const urlImage = body.company.urlImage;
  //console.log(urlImage);

  let pages = 1;
  let actualPage = 1;
  const servicesPerPage = 19;
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
    let lineHeight = 18;
    let lineWidth = 520;
    let fontSize = 9;

    const txtCliente = "Cliente : ";
    const txtClienteWidth = docpdf.widthOfString(txtCliente);
    const txtDocumento = "Documento : ";
    const txtDocumentoWidth = docpdf.widthOfString(txtDocumento);
    const txtCelular = "Celular : ";
    const txtCelularWidth = docpdf.widthOfString(txtCelular);
    const txtEmail = "Email : ";
    const txtEmailWidth = docpdf.widthOfString(txtEmail);
    const primaryColor = body.company.primaryColor || "#000000";
    const clienteDocumento =
      body.customer.customerDocument.trim() || "Não informado";
    const clienteNome = body.customer.customerName.trim() || "Não informado";
    const clienteCelular =
      body.customer.customerCellphone.trim() || "Não informado";
    const clienteEmail = body.customer.customerEmail.trim() || "Não informado";

    //data expiracao
    const expirationDateObj = body.customer.expirationDate;
    const expirationDate = expirationDateObj
      ? new Date(expirationDateObj.seconds * 1000)
      : new Date();
    const expirationDateFormatted = expirationDate.toLocaleDateString("pt-BR");
    //data criacao
    const createdAtObj = body.customer.createdAt;
    const createdAt = createdAtObj
      ? new Date(createdAtObj.seconds * 1000)
      : new Date();
    //const createdAtFormatted = createdAt.toLocaleDateString('pt-BR');

    const dia = createdAt.getDate();
    const mes = createdAt.getMonth() + 1;
    const ano = createdAt.getFullYear();
    const month = months[createdAt.getMonth()];

    // console.log(body.customer.services);

    //ESPACO DA ESQUERDA , ESPAÇO DO TOPO , WIDTH , HEIGTH

    // DADOS DA EMPRESA

    docpdf.fontSize(18);
    docpdf.font("Helvetica-Bold").text("ORÇAMENTO", left + 380, top);
    docpdf.fontSize(11);
    docpdf
      .font("Helvetica")
      .text(dia + " de " + month + " de " + ano, left + 300, top + 20, {
        width: 200,
        align: "right",
      });

    if (body.company.urlImage) {
      try {
        const imageUrl = body.company.urlImage;
        const imageUrlData = await fetch(imageUrl);
        const buffer = await imageUrlData.arrayBuffer();

        docpdf.image(buffer, 50, 50, {
          width: 150,
          height: 50,
        });

        top = top + 65;
      } catch (e) {
        console.log("Não foi possivel adicionar a imagem no documento");
      }
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
      docpdf.font("Helvetica").text(clienteNome, left + txtClienteWidth, top);
      docpdf.font("Helvetica-Bold").text("Documento : ", left + 300, top);
      docpdf
        .font("Helvetica")
        .text(clienteDocumento, left + 300 + txtDocumentoWidth, top);
      top = top + 14;
      docpdf.font("Helvetica-Bold").text(txtCelular, left + 300, top);
      docpdf
        .font("Helvetica")
        .text(clienteCelular, left + 300 + txtCelularWidth, top);

      docpdf.font("Helvetica-Bold").text(txtEmail, left, top);
      docpdf.font("Helvetica").text(clienteEmail, left + txtEmailWidth, top);

      //LINHA DIVISORIA
      docpdf.fillColor("#6c757d");
      docpdf.strokeColor("#6c757d");
      top = top + 23;
      docpdf.lineWidth(0.5);
      docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();
      docpdf.fillColor("#000");
      docpdf.strokeColor("#000");

      //CAMPOS PERSONALIZADOS
      extra?.map((doc, index) => {
        const key = Object.keys(doc)[0];
        if (doc[key] && doc[key].length > 0) {
          top = top + 15;
          docpdf.font("Helvetica-Bold").text(`${key}:`, left, top);
          docpdf.font("Helvetica").text(doc[key], left + 100, top);
        }
      });
      //CAMPOS PERSONALIZADOS

      top = top + 15;
      if (body.customer.obs && body.customer.obs.length > 0) {
        docpdf.font("Helvetica-Bold").text(`Observação:`, left, top);
        top = docpdf
          .font("Helvetica")
          .text(body.customer.obs, left + 80, top, { width: 400 }).y;
      }
    }

    if (actualPage === 1) {
      top = top + 5;
    } else {
      top = top + 50;
    }

    //CABEÇALHO TABELA SERVICOS

    docpdf
      .rect(40, top, lineWidth, lineHeight)
      .fillAndStroke(primaryColor, "#fff");

    docpdf.fillColor("#FFF");
    docpdf.strokeColor("#FFF");

    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Descrição", left, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Qtde. ", left + 230, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Uni. ", left + 270, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Bruto ", left + 310, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Desconto ", left + 380, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Liquido ", left + 450, top + (lineHeight - fontSize) / 2);

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
        //descricao do produto
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            (doc.name || doc.label).slice(0, 43),
            left,
            top + (lineHeight - fontSize) / 2
          );
        //quantidade e unidade de medida
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            `${doc.quantity}`,
            left + 230,
            top + (lineHeight - fontSize) / 2
          );
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text("UNID", left + 270, top + (lineHeight - fontSize) / 2, {
            width: 40,
            align: "left",
          });
        //valor
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValues(doc.totalValue || doc.value || 0),
            left + 310,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValues(doc.discountValue || 0),
            left + 380,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValues(doc.finalValue || doc.totalValue || doc.value || 0),
            left + 450,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );

        top = top + lineHeight; // Move para a próxima linha
      });

    //TOTALIZADOR VALOR
    if (startIndex + servicesPerPage >= totalServices) {
      top = top + 15;

      //docpdf.rect(left + 355, top, 155, lineHeight).fillAndStroke(primaryColor, "#fff");

      //docpdf.fillColor("#FFF");
      //docpdf.strokeColor("#FFF");
      docpdf
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Total Geral : ${valorTotal}`,
          left + 300,
          top + (lineHeight - fontSize) / 2,
          {
            align: "right",
            width: 200,
          }
        );
      top = top + 12;
      docpdf
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Desconto Itens : ${valorDescontoServicosFormatted}`,
          left + 300,
          top + (lineHeight - fontSize) / 2,
          {
            align: "right",
            width: 200,
          }
        );
      top = top + 12;
      docpdf
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Desconto Geral (${discountPercentage}%) : ${valorDescontoGeral}`,
          left + 300,
          top + (lineHeight - fontSize) / 2,
          {
            align: "right",
            width: 200,
          }
        );
      top = top + 22;
      docpdf
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`Total do Orçamento: ${valorTotalGeral}`, left + 250, top, { 
          align: "right",
          width: 250,
        });
      //docpdf.text("R$ " + valorTotal,left + 400,top + (lineHeight - fontSize) / 2);
      docpdf.fontSize(fontSize);
      //docpdf.fillColor("#000");
      //docpdf.strokeColor("#000");

      //TERMO DE CONDICOES
      docpdf.font("Helvetica-Bold").text("Termos e condições ", left, top - 10);
      docpdf
        .font("Helvetica")
        .text("Orçamento válido até " + expirationDateFormatted, left, top + 3);
    }
    // ASSINATURA DO CLIENTE

    if (startIndex + servicesPerPage >= totalServices) {
      docpdf.lineWidth(0.5);
      const line = 750;
      docpdf.lineCap("butt").moveTo(300, line).lineTo(555, line).stroke();
      docpdf.font("Helvetica").text(body.company.nome, left + 350, line + 5);
    }
    //RODAPE PRETO ==1 || BRANCO ==2
    let tipoRodape = 2;
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
