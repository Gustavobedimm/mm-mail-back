const { 
  formatCurrencyBRL, formatNumber2, formatDateBR, formatLongDate,
  tsToDate, safeStr, getExtraFields, loadRemoteImageToBuffer, beginDoc, finalizePDFToBase64
} = require("../utils/buildUtils");

module.exports = async (body) => {
  const docpdf = beginDoc({ autoFirstPage:false });

  // --------- cálculos
  const extra = getExtraFields(body);
  const descontoGeralRaw = Number(body.customer?.discountValue) || 0;
  const descontoServicosRaw = (body.customer?.services || []).reduce((acc, s) => acc + (Number(s.discountValue) || 0), 0);
  const totalRaw = Number(body.customer?.totalValue) || 0;
  const totalGeralRaw = totalRaw - descontoGeralRaw - descontoServicosRaw;
  const descontoPerc = parseFloat((parseFloat(body.customer?.discountPercentage) || 0).toFixed(2));

  const descontoGeral = formatCurrencyBRL(descontoGeralRaw);
  const descontoServicos = formatCurrencyBRL(descontoServicosRaw);
  const total = formatCurrencyBRL(totalRaw);
  const totalGeral = formatCurrencyBRL(totalGeralRaw);

  let pages = 1;
  let actualPage = 1;
  const services = body.customer?.services || [];
  const servicesPerPage = 19; // mantendo seu valor original
  const totalServices = services.length;
  if (totalServices > servicesPerPage) {
    pages = Math.ceil(totalServices / servicesPerPage); // fix
  }

  for (let startIndex = 0; startIndex < totalServices || (startIndex === 0 && totalServices === 0); startIndex += servicesPerPage) {
    docpdf.addPage({ size:"A4", margins:{ top:0,left:0,right:0,bottom:0 } });

    let left = 50, top = 50, lineHeight = 18, lineWidth = 520, fontSize = 9;
    const primaryColor = body.company?.primaryColor || "#000000";

    const createdAt = tsToDate(body.customer?.createdAt);
    const expirationDate = tsToDate(body.customer?.expirationDate);
    const longDate = formatLongDate(createdAt);

    // Título / Data
    docpdf.fontSize(18).font("Helvetica-Bold").text("ORÇAMENTO", left + 380, top);
    docpdf.fontSize(11).font("Helvetica").text(longDate, left + 300, top + 20, { width:200, align:"right" });

    // Logo
    const logoBuf = await loadRemoteImageToBuffer(body.company?.urlImage);
    if (logoBuf) {
      docpdf.image(logoBuf, 50, 50, { width:150, height:50 });
      top += 65;
    }

    // Empresa
    docpdf.fontSize(13).font("Helvetica-Bold").text(safeStr(body.company?.nome), left, top);
    docpdf.fontSize(11); top += 14;
    docpdf.font("Helvetica").text(safeStr(body.company?.documento), left, top);

    // Cliente (apenas página 1)
    if (actualPage === 1) {
      const clienteDocumento = safeStr(body.customer?.customerDocument);
      const clienteNome = safeStr(body.customer?.customerName);
      const clienteCelular = safeStr(body.customer?.customerCellphone);
      const clienteEmail = safeStr(body.customer?.customerEmail);

      top += 45;
      docpdf.font("Helvetica-Bold").text("Cliente : ", left, top);
      const wCliente = docpdf.widthOfString("Cliente : ");
      docpdf.font("Helvetica").text(clienteNome, left + wCliente, top);

      docpdf.font("Helvetica-Bold").text("Documento : ", left + 300, top);
      const wDoc = docpdf.widthOfString("Documento : ");
      docpdf.font("Helvetica").text(clienteDocumento, left + 300 + wDoc, top);

      top += 14;
      docpdf.font("Helvetica-Bold").text("Celular : ", left + 300, top);
      const wCel = docpdf.widthOfString("Celular : ");
      docpdf.font("Helvetica").text(clienteCelular, left + 300 + wCel, top);

      docpdf.font("Helvetica-Bold").text("Email : ", left, top);
      const wEm = docpdf.widthOfString("Email : ");
      docpdf.font("Helvetica").text(clienteEmail, left + wEm, top);

      // Divisória
      docpdf.fillColor("#6c757d").strokeColor("#6c757d").lineWidth(0.5);
      top += 23; docpdf.lineCap("butt").moveTo(40, top).lineTo(555, top).stroke();
      docpdf.fillColor("#000").strokeColor("#000");

      // Extras
      extra?.forEach((obj) => {
        const key = Object.keys(obj)[0];
        if (obj[key]) {
          top += 15;
          docpdf.font("Helvetica-Bold").text(`${key}:`, left, top);
          docpdf.font("Helvetica").text(String(obj[key]), left + 100, top, { width:400 });
        }
      });

      // Observação
      top += 15;
      if (body.customer?.obs) {
        docpdf.font("Helvetica-Bold").text("Observação:", left, top);
        top = docpdf.font("Helvetica").text(body.customer.obs, left + 80, top, { width: 400 }).y;
      }
    }

    // Espaçamento antes da tabela
    top += (actualPage === 1) ? 5 : 50;

    // Cabeçalho tabela
    docpdf.rect(40, top, lineWidth, lineHeight).fillAndStroke(primaryColor, "#fff");
    docpdf.fillColor("#FFF").strokeColor("#FFF").font("Helvetica-Bold").fontSize(fontSize);
    const xuni=210, xqtde=245, xunit=280, xbruto=340, xdesc=400, xliq=460;

    const headY = top + (lineHeight - fontSize) / 2;
    docpdf.text("Descrição", left, headY);
    docpdf.text("Uni", left + xuni, headY);
    docpdf.text("Qtde", left + xqtde, headY);
    docpdf.text("Unitario", left + xunit, headY);
    docpdf.text("Bruto", left + xbruto, headY);
    docpdf.text("Desconto", left + xdesc, headY);
    docpdf.text("Liquido", left + xliq, headY);

    docpdf.fillColor("#000").strokeColor("#000");
    top += lineHeight;

    // Linhas
    const pageItems = services.slice(startIndex, startIndex + servicesPerPage);
    pageItems.forEach((item, idx) => {
      const text = item.name || item.label || "";
      let thisLineH = lineHeight;
      if (text.length > 45) thisLineH += 15;

      // zebra
      docpdf.rect(40, top, lineWidth, thisLineH).fillAndStroke(idx % 2 ? "#f8f9fa" : "#e9ecef", "#fff");

      // Descrição (multi-linha verticalmente centralizada)
      const maxWidth = 215;
      docpdf.fillColor("#000").strokeColor("#000").fontSize(11);
      docpdf.font("Helvetica").fontSize(fontSize);
      const textHeight = docpdf.heightOfString(text, { width: maxWidth });
      const adjustedTop = top + (thisLineH - textHeight) / 2;
      docpdf.text(text, left, adjustedTop, { width:maxWidth });

      // Outras colunas
      const qty = item.quantity || 1;
      const unit = "UND"; // mantém
      const unitPrice = formatNumber2(item.value || 0);
      const bruto = formatNumber2(item.totalValue || item.value || 0);
      const desc = formatNumber2(item.discountValue || 0);
      const liquido = formatNumber2(item.finalValue || item.totalValue || item.value || 0);

      const colY = top + (thisLineH - fontSize) / 2;
      docpdf.text(unit, left + xuni, colY, { width:40, align:"left" });
      docpdf.text(qty, left + xqtde, colY);
      docpdf.text(unitPrice, left + xunit, colY, { width: 60, align:"left" });
      docpdf.text(bruto, left + xbruto, colY, { width: 60, align:"left" });
      docpdf.text(desc, left + xdesc, colY, { width: 60, align:"left" });
      docpdf.text(liquido, left + xliq, colY, { width: 60, align:"left" });

      top += thisLineH;
    });

    // Totais e rodapé somente na última página
    const isLastPage = (startIndex + servicesPerPage) >= totalServices;
    if (isLastPage) {
      top += 15;

      docpdf.fontSize(10).font("Helvetica")
        .text(`Total Geral : ${total}`, left + 300, top, { align:"right", width:200 });
      top += 12;
      docpdf.text(`Desconto Itens : ${descontoServicos}`, left + 300, top, { align:"right", width:200 });
      top += 12;
      docpdf.text(`Desconto Geral (${descontoPerc}%) : ${descontoGeral}`, left + 300, top, { align:"right", width:200 });
      top += 22;

      docpdf.fontSize(13).font("Helvetica-Bold")
        .text(`Total do Orçamento: ${totalGeral}`, left + 250, top, { align:"right", width:250 });

      // Termos
      const expirationDateFormatted = formatDateBR(tsToDate(body.customer?.expirationDate));
      docpdf.fontSize(9);
      docpdf.font("Helvetica-Bold").text("Termos e condições ", left, top - 10);
      docpdf.font("Helvetica").text("Orçamento válido até " + expirationDateFormatted, left, top + 3);

      // Linha assinatura
      docpdf.lineWidth(0.5);
      const lineY = 750;
      docpdf.lineCap("butt").moveTo(300, lineY).lineTo(555, lineY).stroke();

      const assinaturaNome = safeStr(body.company?.nome, "");
      docpdf.font("Helvetica").fontSize(9).text(assinaturaNome, 200, lineY + 5, { width:355, align:"right" });

      // Rodapé claro
      docpdf.fillColor("#6c757d").strokeColor("#6c757d").lineWidth(0.5);
      docpdf.lineCap("butt").moveTo(40, 780).lineTo(555, 780).stroke();
      docpdf.fillColor("#000").strokeColor("#000").fontSize(9);
      docpdf.font("Helvetica-Bold").text("Dados para contato ", left, 795);
      docpdf.font("Helvetica-Bold").text("Endereço  ", left + 150, 795);
      docpdf.font("Helvetica").text(safeStr(body.company?.email, ""), left, 805);
      docpdf.font("Helvetica").text(safeStr(body.company?.endereco, ""), left + 150, 805);
      docpdf.font("Helvetica").text(safeStr(body.company?.celular, ""), left, 815);
      docpdf.font("Helvetica").text(
        `${safeStr(body.company?.cidade,"")} - ${safeStr(body.company?.estado,"")}`,
        left + 150, 815
      );
    }

    // Marca de página
    docpdf.font("Helvetica").fontSize(9).text(`Página ${actualPage} de ${pages}`, left + 450, 815);
    actualPage++;
  }

  return finalizePDFToBase64(docpdf);
};
