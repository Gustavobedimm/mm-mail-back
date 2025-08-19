const {
    formatCurrencyBRL, formatNumber2, formatDateBR, formatLongDate,
    tsToDate, safeStr, getExtraFields, loadRemoteImageToBuffer, beginDoc, finalizePDFToBase64
  } = equire("./src/templates/utils");
  
  module.exports = async (body) => {
    const doc = beginDoc({ autoFirstPage:false });
    const primary = body.company?.primaryColor || "#0f172a";
    const services = body.customer?.services || [];
    const servicesPerPage = 18; // um a menos por causa do cabeçalho alto
    const pages = Math.max(1, Math.ceil(services.length / servicesPerPage));
    let pageNo = 1;
  
    // Totais
    const descontoGeralRaw = Number(body.customer?.discountValue) || 0;
    const descontoServRaw = services.reduce((a,s)=>a+(Number(s.discountValue)||0),0);
    const totalRaw = Number(body.customer?.totalValue) || 0;
    const totalGeralRaw = totalRaw - descontoGeralRaw - descontoServRaw;
  
    const descontoGeral = formatCurrencyBRL(descontoGeralRaw);
    const descontoServ = formatCurrencyBRL(descontoServRaw);
    const total = formatCurrencyBRL(totalRaw);
    const totalGeral = formatCurrencyBRL(totalGeralRaw);
    const descontoPerc = parseFloat((parseFloat(body.customer?.discountPercentage) || 0).toFixed(2));
  
    for (let start=0; start < services.length || (start===0 && services.length===0); start += servicesPerPage) {
      doc.addPage({ size:"A4", margins:{ top:0,left:0,right:0,bottom:0 } });
  
      // Faixa topo
      doc.rect(0,0,doc.page.width,70).fill(primary);
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(20).text("ORÇAMENTO", 50, 22);
  
      // Logo
      const logo = await loadRemoteImageToBuffer(body.company?.urlImage);
      if (logo) {
        try { doc.image(logo, doc.page.width-180, 10, { width:130, height:50 }); } catch {}
      }
  
      // Sub-infos topo
      const createdAt = tsToDate(body.customer?.createdAt);
      doc.font("Helvetica").fontSize(10).text(`Emitido em: ${formatLongDate(createdAt)}`, 50, 52, { width:doc.page.width-100, align:"left" });
  
      // Blocos empresa/cliente (cartões)
      let y = 90;
      doc.roundedRect(50, y, 240, 70, 8).strokeColor("#e2e8f0").lineWidth(1).stroke();
      doc.fontSize(11).fillColor("#111").font("Helvetica-Bold").text(safeStr(body.company?.nome), 60, y+10, { width:220 });
      doc.font("Helvetica").fontSize(9).fillColor("#475569")
        .text(safeStr(body.company?.documento), 60, y+28, { width:220 })
        .text(`${safeStr(body.company?.email,"")} • ${safeStr(body.company?.celular,"")}`, 60, y+42, { width:220 })
        .text(`${safeStr(body.company?.cidade,"")} - ${safeStr(body.company?.estado,"")}`, 60, y+56, { width:220 });
  
      const clienteNome = safeStr(body.customer?.customerName);
      const clienteDoc = safeStr(body.customer?.customerDocument);
      const clienteCel = safeStr(body.customer?.customerCellphone);
      const clienteEmail = safeStr(body.customer?.customerEmail);
  
      doc.roundedRect(310, y, 240, 70, 8).strokeColor("#e2e8f0").lineWidth(1).stroke();
      doc.fontSize(11).fillColor("#111").font("Helvetica-Bold").text(clienteNome, 320, y+10, { width:220 });
      doc.font("Helvetica").fontSize(9).fillColor("#475569")
        .text(clienteDoc, 320, y+28, { width:220 })
        .text(`${clienteEmail} • ${clienteCel}`, 320, y+42, { width:220 });
  
      // Observação / Extras (só 1ª página)
      y += 90;
      if (pageNo === 1) {
        const extras = getExtraFields(body);
        if (extras?.length) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#111").text("Informações adicionais", 50, y);
          y += 12;
          doc.font("Helvetica").fontSize(9).fillColor("#111");
          extras.forEach((o) => {
            const k = Object.keys(o)[0];
            doc.text(`${k}: ${o[k]}`, 50, y, { width:500 });
            y += 12;
          });
        }
        if (body.customer?.obs) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#111").text("Observações", 50, y);
          y = doc.font("Helvetica").fontSize(9).fillColor("#111").text(body.customer.obs, 50, y+12, { width:500 }).y + 10;
        }
      }
  
      // Cabeçalho da tabela
      const startTableY = y + 6;
      doc.rect(50, startTableY, 500, 22).fill(primary);
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(9)
        .text("Descrição", 60, startTableY + 6, { width:230 })
        .text("Qtd", 300, startTableY + 6, { width:40, align:"right" })
        .text("Unit.", 350, startTableY + 6, { width:70, align:"right" })
        .text("Desc.", 430, startTableY + 6, { width:50, align:"right" })
        .text("Líquido", 490, startTableY + 6, { width:50, align:"right" });
  
      // Linhas
      let rowY = startTableY + 22;
      const rows = services.slice(start, start + servicesPerPage);
      rows.forEach((it, i) => {
        const h = 20 + (String(it.name||it.label||"").length > 50 ? 10 : 0);
        // zebra
        doc.rect(50, rowY, 500, h).fill(i % 2 ? "#f8fafc" : "#eef2f7");
  
        doc.fillColor("#0f172a").font("Helvetica").fontSize(9);
        doc.text(String(it.name||it.label||""), 60, rowY + 6, { width:230 });
        doc.text(String(it.quantity || 1), 300, rowY + 6, { width:40, align:"right" });
        doc.text(formatNumber2(it.value || 0), 350, rowY + 6, { width:70, align:"right" });
        doc.text(formatNumber2(it.discountValue || 0), 430, rowY + 6, { width:50, align:"right" });
        const liq = formatNumber2(it.finalValue || it.totalValue || it.value || 0);
        doc.text(liq, 490, rowY + 6, { width:50, align:"right" });
  
        rowY += h;
      });
  
      // Rodapé (última página)
      const isLast = (start + servicesPerPage) >= services.length;
      if (isLast) {
        const boxY = rowY + 10;
        // Resumo à direita
        doc.roundedRect(310, boxY, 240, 100, 8).strokeColor("#e2e8f0").lineWidth(1).stroke();
        doc.font("Helvetica").fontSize(9).fillColor("#475569")
          .text("Total Geral", 320, boxY + 10)
          .text("Descontos (itens)", 320, boxY + 28)
          .text(`Desconto geral (${descontoPerc}%)`, 320, boxY + 46)
          .text("Total do Orçamento", 320, boxY + 70);
  
        doc.font("Helvetica-Bold").fillColor("#0f172a")
          .text(total, 0, boxY + 10, { align:"right", width:540 })
          .text(descontoServ, 0, boxY + 28, { align:"right", width:540 })
          .text(descontoGeral, 0, boxY + 46, { align:"right", width:540 });
  
        doc.fontSize(12).fillColor(primary).text(totalGeral, 0, boxY + 68, { align:"right", width:540 });
  
        // Validade
        const exp = tsToDate(body.customer?.expirationDate);
        doc.font("Helvetica").fontSize(9).fillColor("#111")
          .text(`Validade: ${formatDateBR(exp)}`, 50, boxY + 8);
  
        // Assinatura
        const lineY = boxY + 120;
        doc.lineWidth(0.5).moveTo(310, lineY).lineTo(550, lineY).strokeColor("#94a3b8").stroke();
        doc.font("Helvetica").fontSize(9).fillColor("#475569").text(safeStr(body.company?.nome,""), 310, lineY + 6, { width:240, align:"center" });
      }
  
      // Página x de y
      doc.font("Helvetica").fontSize(9).fillColor("#475569").text(`Página ${pageNo} de ${pages}`, 50, 825, { width:500, align:"right" });
  
      pageNo++;
    }
  
    return finalizePDFToBase64(doc);
  };
  