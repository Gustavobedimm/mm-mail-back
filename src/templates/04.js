// Template "artsy" — inspirado no layout compartilhado (faixas/formas, título forte)
// Requer utils.js conforme sugerido anteriormente.
const {
    formatCurrencyBRL, formatNumber2, formatDateBR, formatLongDate,
    tsToDate, safeStr, getExtraFields, loadRemoteImageToBuffer, beginDoc
  } = require("./utils");
  
  module.exports = async (body) => {
    const doc = beginDoc({ autoFirstPage:false });
  
    // Paleta baseada na imagem: magenta, mostarda, cinza quente
    const magenta = body.company?.primaryColor || "#B1106F";
    const mustard = "#C0900C";
    const charcoal = "#2B2B2B";
    const grayText = "#6B7280";
    const lineMuted = "#E5E7EB";
    const bgSoft = "#F6F7F8";
  
    const services = body.customer?.services || [];
    const servicesPerPage = 16; // menos linhas p/ acomodar header alto e blocos
    const pages = Math.max(1, Math.ceil(services.length / servicesPerPage));
    let pageNo = 1;
  
    // Totais
    const descontoGeralRaw = Number(body.customer?.discountValue) || 0;
    const descontoServRaw = services.reduce((a,s)=>a+(Number(s.discountValue)||0),0);
    const totalRaw = Number(body.customer?.totalValue) || 0;
    const totalGeralRaw = totalRaw - descontoGeralRaw - descontoServRaw;
  
    const total = formatCurrencyBRL(totalRaw);
    const descontoItens = formatCurrencyBRL(descontoServRaw);
    const descontoGeral = formatCurrencyBRL(descontoGeralRaw);
    const descontoPerc = parseFloat((parseFloat(body.customer?.discountPercentage) || 0).toFixed(2));
    const totalGeral = formatCurrencyBRL(totalGeralRaw);
  
    // Datas
    const createdAt = tsToDate(body.customer?.createdAt);
    const expirationDate = tsToDate(body.customer?.expirationDate);
  
    // Helpers visuais ----------------------------------------------------------
    function drawBackgroundShapes() {
        const pageW = doc.page.width;
        const pageH = doc.page.height;
      
        // fundo
        doc.rect(0, 0, pageW, pageH).fill("#F6F7F8");
      
        // mancha superior esquerda
        doc.save()
          .fillColor("#EAD9DE")
          .moveTo(0, 120)
          .bezierCurveTo(120, 80, 140, 200, 0, 260)
          .fill()
        .restore();
      
        // mancha inferior direita
        doc.save()
          .fillColor("#EFE6D1")
          .moveTo(pageW, pageH - 180)
          .bezierCurveTo(pageW - 120, pageH - 220, pageW - 100, pageH - 60, pageW, pageH - 40)
          .fill()
        .restore();
      
        // riscos mostarda
        doc.save()
          .strokeColor(mustard).lineWidth(3)
          .moveTo(60, 165).lineTo(200, 165).stroke();
        doc
          .moveTo(70, 720).bezierCurveTo(120, 690, 180, 760, 260, 740).stroke();
        doc.restore();
      
        // rabiscos magenta
        doc.save()
          .strokeColor(magenta).lineWidth(2)
          .moveTo(pageW - 140, 120).lineTo(pageW - 40, 120).stroke();
        doc
          .moveTo(pageW - 150, 130).lineTo(pageW - 60, 130).stroke();
        doc.restore();
      
        // faixa de rodapé magenta (canto inferior direito)
        doc.save()
          .fillColor(magenta)
          .rect(pageW - 240, pageH - 90, 240, 90)
          .fill()
        .restore();
      }
      
  
    async function drawHeader() {
      // faixa superior mínima (linha divisória)
      doc.save().strokeColor(lineMuted).lineWidth(1).moveTo(50,90).lineTo(doc.page.width-50,90).stroke().restore();
  
      // logo (se houver)
      const logo = await loadRemoteImageToBuffer(body.company?.urlImage);
      if (logo) {
        try { doc.image(logo, 50, 34, { width:140, height:46 }); } catch {}
      }
  
      // linha de topo: "Empresa | área"
      const topTextY = 40;
      doc.font("Helvetica").fontSize(10).fillColor(grayText)
        .text(`${safeStr(body.company?.nome,"")}${body.company?.segmento ? " | " + safeStr(body.company.segmento) : ""}`, 50, topTextY, { width:350 });
  
      // Título forte
      doc.font("Helvetica-Bold").fontSize(26).fillColor(magenta)
        .text("Orçamento de Serviços", 50, 100);
  
      // Meta: Nº + data (estilo caps)
      doc.font("Helvetica").fontSize(10).fillColor(grayText)
        .text(`ORÇAMENTO Nº ${safeStr(body.customer?.id || body.customer?.budgetNumber || body.customer?.budgetId || "—")}  |  ${formatLongDate(createdAt)}`, 50, 132);
  
      // linha após meta
      doc.save().strokeColor(lineMuted).lineWidth(1).moveTo(50,155).lineTo(doc.page.width-50,155).stroke().restore();
    }
  
    function drawAddressedTo(startY) {
      // bloco "este orçamento é destinado a:"
      const y = startY;
      doc.font("Helvetica").fontSize(9).fillColor(grayText).text("Este orçamento é destinado a:", 50, y);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(charcoal)
        .text(safeStr(body.customer?.customerName,"Cliente"), 50, y+14, { width:280 });
  
      // se tiver documento / email / telefone
      let info = [];
      if (body.customer?.customerDocument) info.push(safeStr(body.customer.customerDocument));
      if (body.customer?.customerEmail) info.push(safeStr(body.customer.customerEmail));
      if (body.customer?.customerCellphone) info.push(safeStr(body.customer.customerCellphone));
      if (info.length) doc.font("Helvetica").fontSize(9).fillColor(grayText).text(info.join(" • "), 50, y+30, { width:280 });
  
      // coluna direita: total
      doc.font("Helvetica-Bold").fontSize(10).fillColor(charcoal).text("Total do Orçamento", 380, y);
      doc.font("Helvetica-Bold").fontSize(18).fillColor(magenta).text(totalGeral, 380, y+16, { width:180, align:"right" });
  
      // linha fina separadora
      doc.save().strokeColor(lineMuted).lineWidth(1).moveTo(50, y+48).lineTo(doc.page.width-50, y+48).stroke().restore();
      return y+56;
    }
  
    function drawTableHeader(y) {
      doc.save();
      doc.rect(50, y, 500, 24).fillAndStroke("#F0EFF5", "#E8E7ED");
      doc.fillColor(magenta).font("Helvetica-Bold").fontSize(10);
      doc.text("Descrição", 60, y+6, { width:250 });
      doc.text("Unit x Preço", 330, y+6, { width:90, align:"right" });
      doc.text("Valor Devido", 440, y+6, { width:95, align:"right" });
      doc.restore();
      return y+24;
    }
  
    function drawTableRows(yStart, items) {
      let y = yStart;
      items.forEach((it, i) => {
        const text = String(it.name || it.label || "");
        const extraH = text.length > 60 ? 8 : 0;
        const h = 20 + extraH;
  
        // zebra suave
        if (i % 2) doc.save().rect(50, y, 500, h).fill("#FAFAFB").restore();
  
        doc.font("Helvetica").fontSize(9).fillColor(charcoal)
          .text(text, 60, y + 5, { width:250 });
  
        const qty = it.quantity || 1;
        const unitStr = `${qty} x ${formatNumber2(it.value || 0)}`;
        doc.text(unitStr, 330, y + 5, { width:90, align:"right" });
  
        const due = formatNumber2(it.finalValue || it.totalValue || it.value || 0);
        doc.text(due, 440, y + 5, { width:95, align:"right" });
  
        y += h;
      });
      return y;
    }
  
    function drawTotalsBlock(y) {
      // linha divisória
      doc.save().strokeColor(lineMuted).lineWidth(1).moveTo(50, y).lineTo(doc.page.width-50, y).stroke().restore();
      y += 10;
  
      // coluna direita resumida
      doc.font("Helvetica").fontSize(9).fillColor(grayText)
        .text("Total Geral", 360, y)
        .text("Descontos (itens)", 360, y+16)
        .text(`Desconto geral (${descontoPerc}%)`, 360, y+32);
  
      doc.font("Helvetica-Bold").fontSize(10).fillColor(charcoal)
        .text(total, 0, y, { width:540, align:"right" })
        .text(descontoItens, 0, y+16, { width:540, align:"right" })
        .text(descontoGeral, 0, y+32, { width:540, align:"right" });
  
      // destaque do total
      y += 52;
      doc.roundedRect(320, y, 230, 46, 8).fillAndStroke("#FFEFF7", "#F8C9E2");
      doc.fillColor(magenta).font("Helvetica-Bold").fontSize(12)
        .text("TOTAL A PAGAR", 330, y+10);
      doc.fontSize(16).text(totalGeral, 0, y+8, { width:540, align:"right" });
  
      return y+60;
    }
  
    function drawBankAndValidity(y) {
      // coluna esquerda: Dados bancários
      doc.font("Helvetica-Bold").fontSize(10).fillColor(charcoal).text("Dados bancários", 50, y);
      doc.font("Helvetica").fontSize(9).fillColor(grayText);
      const bankLines = [];
      if (body.company?.bankName) bankLines.push(safeStr(body.company.bankName));
      if (body.company?.bankAgency) bankLines.push("Agência: " + safeStr(body.company.bankAgency));
      if (body.company?.bankAccount) bankLines.push("Conta: " + safeStr(body.company.bankAccount));
      if (body.company?.pix) bankLines.push("PIX: " + safeStr(body.company.pix));
      if (!bankLines.length) bankLines.push("Informe seus dados (ex.: Banco, Agência, Conta, PIX).");
      doc.text(bankLines.join("\n"), 50, y+14, { width:220 });
  
      // coluna direita: validade
      doc.font("Helvetica-Bold").fontSize(10).fillColor(charcoal).text("Validade do orçamento", 300, y);
      doc.font("Helvetica").fontSize(9).fillColor(grayText)
        .text(formatDateBR(expirationDate), 300, y+14, { width:250 });
  
      return y+60;
    }
  
    function drawFooterContact() {
      // textos brancos sobre a "faixa" magenta do canto
      const x = doc.page.width - 240;
      const y = doc.page.height - 82;
      doc.fillColor("#fff").font("Helvetica").fontSize(9)
        .text(`${safeStr(body.company?.endereco,"")}`, x+14, y, { width:210 })
        .text(`${safeStr(body.company?.cidade,"")} - ${safeStr(body.company?.estado,"")}`, x+14, y+14, { width:210 })
        .text(safeStr(body.company?.email,""), x+14, y+28, { width:210 })
        .text(safeStr(body.company?.celular,""), x+14, y+42, { width:210 });
    }
  
    // Render por páginas -------------------------------------------------------
    for (let start=0; start < services.length || (start===0 && services.length===0); start += servicesPerPage) {
      doc.addPage({ size:"A4", margins:{ top:0,left:0,right:0,bottom:0 } });
  
      drawBackgroundShapes();
      await drawHeader();
  
      let y = drawAddressedTo(170);
  
      // tabela
      y = drawTableHeader(y);
      const rows = services.slice(start, start + servicesPerPage);
      y = drawTableRows(y, rows);
  
      // última página: totais + dados bancários + validade
      const isLast = (start + servicesPerPage) >= services.length;
      if (isLast) {
        y = drawTotalsBlock(y + 10);
        y = drawBankAndValidity(y + 10);
      }
  
      // paginação
      doc.font("Helvetica").fontSize(9).fillColor(grayText)
        .text(`Página ${pageNo} de ${pages}`, 50, doc.page.height-30, { width:500, align:"right" });
  
      drawFooterContact();
      pageNo++;
    }
  
    doc.end();
    return doc.read().toString("base64");
  };
  