const PDFDocument = require("pdfkit");
const { finalizePDFToBase64 } = require("../templates/utils");


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

function formatValues(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
function formatValuesSemCifrao(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  const rawDiscount = parseFloat(body.customer.discountPercentage) || 0;
  const discountPercentage = parseFloat(rawDiscount.toFixed(2));

  var docpdf = new PDFDocument({ autoFirstPage: false });


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

    const dia = createdAt.getDate();
    const mes = createdAt.getMonth() + 1;
    const ano = createdAt.getFullYear();
    const month = months[createdAt.getMonth()];


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
    const xuni = 210;
    const xqtde = 245;
    const xunitario = 280;
    const xbruto = 340;
    const xdesconto = 400;
    const xliquido = 460;

    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Descrição", left, top + (lineHeight - fontSize) / 2);
      docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Uni", left + xuni, top + (lineHeight - fontSize) / 2);
      docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Qtde", left + xqtde, top + (lineHeight - fontSize) / 2);
      docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Unitario", left + xunitario, top + (lineHeight - fontSize) / 2);
    
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Bruto ", left + xbruto, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Desconto ", left + xdesconto, top + (lineHeight - fontSize) / 2);
    docpdf
      .fontSize(fontSize)
      .font("Helvetica-Bold")
      .text("Liquido ", left + xliquido, top + (lineHeight - fontSize) / 2);

    docpdf.fillColor("#000");
    docpdf.strokeColor("#000");

    //SERVICOS

    top = top + lineHeight;

    body.customer.services
      .slice(startIndex, startIndex + servicesPerPage)
      .forEach((doc, index) => {

        const text = doc.name || doc.label;
        

        // LINHAS DE SERVICOS
        if (text.length > 45) {
          lineHeight += 15; //
        }

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
        
        
        
        //DESCRICAO DO ITEM ******************************************************

        const maxWidth = 215;
        const font = "Helvetica";
        const size = fontSize;
        docpdf.font(font).fontSize(size); 
        const textHeight = docpdf.heightOfString(text, { width: maxWidth });
        const adjustedTop = top + (lineHeight - textHeight) / 2;

        docpdf.fontSize(fontSize).font("Helvetica").text(text ,left, adjustedTop ,
            {
              width: 215, 
            }
          );
        //DESCRICAO DO ITEM ******************************************************

        //UNIDADE DO ITEM *******************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text("UND", left + xuni, top + (lineHeight - fontSize) / 2, {
            width: 40,
            align: "left",
          });
          //UNIDADE DO ITEM *******************************************************

        //QUANTIDADE DO ITEM *****************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(doc.quantity || 1,
            left + xqtde,
            top + (lineHeight - fontSize) / 2
          );
          //QUANTIDADE DO ITEM *****************************************************

        //VALOR unitario DO ITEM *******************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValuesSemCifrao(doc.value || 0),
            left + xunitario,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
          //VALOR unitario DO ITEM *******************************************************

        //VALOR BRUTO DO ITEM *******************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValuesSemCifrao(doc.totalValue || doc.value || 0),
            left + xbruto,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
          //VALOR BRUTO DO ITEM *******************************************************

        //DESCONTO DO ITEM *******************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValuesSemCifrao(doc.discountValue || 0),
            left + xdesconto,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
          //DESCONTO DO ITEM *******************************************************

        //VALOR LIQUIDO DO ITEM *******************************************************
        docpdf
          .fontSize(fontSize)
          .font("Helvetica")
          .text(
            formatValuesSemCifrao(doc.finalValue || doc.totalValue || doc.value || 0),
            left + xliquido,
            top + (lineHeight - fontSize) / 2,
            {
              width: 60,
              align: "left",
            }
          );
          //VALOR LIQUIDO DO ITEM *******************************************************

        //AVANCA O TOP para a proxima linha levando em consideracao o tamanho da linha desenhada
        //se o texto for muito grande, aumenta o lineHeight
          top = top + lineHeight;

        //volta ao line height original  
        if (text.length > 45) {
          lineHeight -= 15; //
        } 
      });

    //TOTALIZADOR VALOR
    if (startIndex + servicesPerPage >= totalServices) {

      top = top + 15;

      //TOTAL GERAL *******************************************************
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
        //TOTAL GERAL *******************************************************

      top = top + 12;

      //TOTAS DESCONTO ITENS *******************************************************
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
        //TOTAS DESCONTO ITENS *******************************************************

      top = top + 12;

      //TOTAS DESCONTO GERAL *******************************************************
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
        //TOTAS DESCONTO GERAL *******************************************************

      top = top + 22;

      //TOTAS ORCAMENTO *******************************************************
      docpdf
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`Total do Orçamento: ${valorTotalGeral}`, left + 250, top, {
          align: "right",
          width: 250,
        });
        //TOTAS ORCAMENTO *******************************************************


      docpdf.fontSize(fontSize);

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
      //docpdf.font("Helvetica").text(body.company.nome, left + 350, line + 5);

      const text = body.company.nome;
      const x = 200; // início da área
      const width = 355; // largura da área (ex: 555 - 300)
      const y = line + 5;
      docpdf.font("Helvetica").fontSize(fontSize) // defina o fontSize se ainda não tiver
      .text(text, x, y, {
        width: width,
        align: 'right',
      });
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
  return finalizePDFToBase64(docpdf);
};
