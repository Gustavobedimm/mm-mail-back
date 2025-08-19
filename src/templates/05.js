// Template "corporate-green" — inspirado no layout com faixa verde e blocos
// Requer utils.js (formatadores e helpers) conforme já enviado.
const {
    formatCurrencyBRL, formatNumber2, formatDateBR, formatLongDate,
    tsToDate, safeStr, getExtraFields, loadRemoteImageToBuffer, beginDoc, finalizePDFToBase64
  } = require("./utils");
  
  module.exports = async (body) => {
    const doc = beginDoc({ autoFirstPage: false });
  
    const primary = body.company?.primaryColor || "#16A34A"; // verde
    const gray100 = "#F3F4F6";
    const gray200 = "#E5E7EB";
    const gray500 = "#6B7280";
    const gray700 = "#374151";
    const black = "#111827";
  
    // Dados base
    const services = body.customer?.services || [];
    const servicesPerPage = 18; // espaço p/ cabeçalhos e blocos
    const pages = Math.max(1, Math.ceil((services.length || 1) / servicesPerPage));
    let pageNo = 1;
  
    // Totais com seu modelo de dados
    const descontoGeralRaw = Number(body.customer?.discountValue) || 0;
    const descontoItensRaw = services.reduce((acc, s) => acc + (Number(s.discountValue) || 0), 0);
    const subtotalRaw = Number(body.customer?.totalValue) || 0;
    const totalGeralRaw = subtotalRaw - descontoGeralRaw - descontoItensRaw;
  
    const descontoPerc = parseFloat((parseFloat(body.customer?.discountPercentage) || 0).toFixed(2));
    const subtotal = formatCurrencyBRL(subtotalRaw);
    const descontoItens = formatCurrencyBRL(descontoItensRaw);
    const descontoGeral = formatCurrencyBRL(descontoGeralRaw);
    const totalGeral = formatCurrencyBRL(totalGeralRaw);
  
    const createdAt = tsToDate(body.customer?.createdAt);
    const expirationDate = tsToDate(body.customer?.expirationDate);
  
    async function drawHeader() {
      // Faixa verde superior
      doc.save()
        .fillColor(primary)
        .rect(0, 0, doc.page.width, 36)
        .fill()
      .restore();
  
      // Título à direita
      doc.font("Helvetica-Bold").fontSize(20).fillColor(black)
        .text("Orçamento", 0, 48, { align: "right", width: doc.page.width - 50 });
  
      // Logo e dados da empresa (coluna esquerda)
      const logo = await loadRemoteImageToBuffer(body.company?.urlImage);
      if (logo) {
        try { doc.image(logo, 50, 50, { width: 130, height: 40 }); } catch {}
      } else {
        doc.font("Helvetica-Bold").fontSize(18).fillColor(black).text("SEU LOGO", 50, 60);
      }
  
      // Empresa — nomes/contatos
      let y = 98;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(black)
        .text(safeStr(body.company?.nome, "Sua Empresa"), 50, y);
      doc.font("Helvetica").fontSize(9).fillColor(gray700)
        .text(safeStr(body.company?.endereco, ""), 50, y + 14)
        .text(`${safeStr(body.company?.cidade, "")} - ${safeStr(body.company?.estado, "")}`, 50, y + 26)
        .text(`Email: ${safeStr(body.company?.email, "")}`, 50, y + 38)
        .text(`Telefone: ${safeStr(body.company?.celular, "")}`, 50, y + 50)
        .text(`Website: ${safeStr(body.company?.website, "")}`, 50, y + 62);
  
      // Linha sutil
      doc.save().strokeColor(gray200).lineWidth(1)
        .moveTo(50, 150).lineTo(doc.page.width - 50, 150).stroke().restore();
  
      // Bloco cinza com Bill to / Ship to / Details
      const boxY = 170;
      doc.save().fillColor(gray100).rect(50, boxY, 500, 88).fill().restore();
  
      // Coluna 1 — Bill to
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text("Bill to", 60, boxY + 10);
      doc.font("Helvetica").fontSize(9).fillColor(gray700)
        .text(safeStr(body.customer?.customerName, "Cliente"), 60, boxY + 26)
        .text(safeStr(body.customer?.endereco, ""), 60, boxY + 38)
        .text(`${safeStr(body.customer?.cidade, "")} - ${safeStr(body.customer?.estado, "")}`, 60, boxY + 50);
  
      // Coluna 2 — Ship to (opcional)
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text("Ship to", 210, boxY + 10);
      doc.font("Helvetica").fontSize(9).fillColor(gray700)
        .text(safeStr(body.customer?.shipToName, ""), 210, boxY + 26)
        .text(safeStr(body.customer?.shipToAddress, ""), 210, boxY + 38)
        .text(safeStr(body.customer?.shipToCityState, ""), 210, boxY + 50);
  
      // Coluna 3 — Details
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text("Details", 360, boxY + 10);
      doc.font("Helvetica").fontSize(9).fillColor(gray700)
        .text(`Nº orçamento: ${safeStr(body.customer?.id || body.customer?.budgetId || body.customer?.budgetNumber, "—")}`, 360, boxY + 26)
        .text(`Data emissão: ${formatLongDate(createdAt)}`, 360, boxY + 38)
        .text(`Validade: ${formatDateBR(expirationDate)}`, 360, boxY + 50);
    }
  
    function drawTableHeader(y) {
      doc.save()
        .fillColor(gray100)
        .rect(50, y, 500, 22)
        .fill()
      .restore();
  
      doc.font("Helvetica-Bold").fontSize(9).fillColor(black)
        .text("Produto / Serviço", 60, y + 6, { width: 160 })
        .text("Descrição", 230, y + 6, { width: 140 })
        .text("Qtde", 380, y + 6, { width: 40, align: "right" })
        .text("Unit.", 430, y + 6, { width: 55, align: "right" })
        .text("Total", 490, y + 6, { width: 50, align: "right" });
  
      // linha separadora
      doc.save().strokeColor(gray200).lineWidth(1)
        .moveTo(50, y + 22).lineTo(550, y + 22).stroke().restore();
  
      return y + 24;
    }
  
    function drawRows(y, items) {
      let cursor = y;
      items.forEach((it, i) => {
        const name = String(it.name || it.label || "");
        const desc = String(it.description || "");
        const h = Math.max(
          18,
          doc.heightOfString(name, { width: 160, align: "left" }) + 6,
          doc.heightOfString(desc, { width: 140, align: "left" }) + 6
        );
  
        // zebra sutil
        if (i % 2) {
          doc.save().fillColor("#FBFBFB").rect(50, cursor, 500, h).fill().restore();
        }
  
        doc.font("Helvetica").fontSize(9).fillColor(gray700)
          .text(name, 60, cursor + 4, { width: 160 })
          .text(desc, 230, cursor + 4, { width: 140 })
          .text(String(it.quantity || 1), 380, cursor + 4, { width: 40, align: "right" })
          .text(formatNumber2(it.value || 0), 430, cursor + 4, { width: 55, align: "right" })
          .text(formatNumber2(it.finalValue || it.totalValue || it.value || 0), 490, cursor + 4, { width: 50, align: "right" });
  
        // linha inferior
        doc.save().strokeColor(gray200).lineWidth(0.5)
          .moveTo(50, cursor + h).lineTo(550, cursor + h).stroke().restore();
  
        cursor += h;
      });
      return cursor;
    }
  
    function drawTotals(y) {
      // coluna direita com subtotal/ descontos e total
      const rightX = 330;
  
      doc.font("Helvetica").fontSize(9).fillColor(gray700)
        .text("Subtotal", rightX, y, { width: 120 })
        .text("Desconto (itens)", rightX, y + 14, { width: 120 })
        .text(`Desconto geral (${descontoPerc}%)`, rightX, y + 28, { width: 160 });
  
      doc.font("Helvetica-Bold").fontSize(9).fillColor(black)
        .text(subtotal, 0, y, { width: 550, align: "right" })
        .text(descontoItens, 0, y + 14, { width: 550, align: "right" })
        .text(descontoGeral, 0, y + 28, { width: 550, align: "right" });
  
      // linha antes do total
      doc.save().strokeColor(gray200).lineWidth(1)
        .moveTo(330, y + 48).lineTo(550, y + 48).stroke().restore();
  
      // Total destacado
      doc.font("Helvetica-Bold").fontSize(12).fillColor(black)
        .text("Total", rightX, y + 54, { width: 120 });
      doc.fontSize(14).fillColor(primary)
        .text(totalGeral, 0, y + 52, { width: 550, align: "right" });
    }
  
    function drawFooter(pageNo, pages) {
      // margem inferior
      doc.font("Helvetica").fontSize(9).fillColor(gray500)
        .text(`Página ${pageNo} de ${pages}`, 50, doc.page.height - 30, { width: 500, align: "right" });
    }
  
    for (let start = 0; start < services.length || (start === 0 && services.length === 0); start += servicesPerPage) {
      doc.addPage({ size: "A4", margins: { top: 0, left: 0, right: 0, bottom: 0 } });
  
      await drawHeader();
  
      // Observações (só na 1ª página)
      let y = 270;
      if (pageNo === 1 && body.customer?.obs) {
        doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text("Mensagem ao cliente", 50, y);
        y = doc.font("Helvetica").fontSize(9).fillColor(gray700).text(body.customer.obs, 50, y + 14, { width: 500 }).y + 8;
      }
  
      // Tabela
      y = drawTableHeader(y);
      const rows = services.slice(start, start + servicesPerPage);
      y = drawRows(y, rows);
  
      // Totais apenas na última página
      const isLast = (start + servicesPerPage) >= services.length;
      if (isLast) {
        y += 12;
        drawTotals(y);
      }
  
      drawFooter(pageNo, pages);
      pageNo++;
    }
  
    return finalizePDFToBase64(doc);
  };
  