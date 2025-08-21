const { 
  formatCurrencyBRL, formatNumber2, formatDateBR, formatLongDate,
  tsToDate, safeStr, getExtraFields, loadRemoteImageToBuffer, beginDoc, finalizePDFToBase64
} = require("../utils/buildUtils");
  
  module.exports = async (body) => {
    const extra = getExtraFields(body);
    const doc = beginDoc({ autoFirstPage:false });
    const primary = body.company?.primaryColor || "#111827";
  
    const services = body.customer?.services || [];
    const servicesPerPage = 22; // mais linhas por página
    const pages = Math.max(1, Math.ceil(services.length / servicesPerPage));
    let pageNo = 1;
  
    // Totais
    const descontoGeralRaw = Number(body.customer?.discountValue) || 0;
    const descontoServRaw = services.reduce((a,s)=>a+(Number(s.discountValue)||0),0);
    const totalRaw = Number(body.customer?.totalValue) || 0;
    const totalGeralRaw = totalRaw - descontoGeralRaw - descontoServRaw;
  
    const totalGeral = formatCurrencyBRL(totalGeralRaw);
  
    for (let start=0; start < services.length || (start===0 && services.length===0); start += servicesPerPage) {
      doc.addPage({ size:"A4", margins:{ top:0,left:0,right:0,bottom:0 } });
  
      // Cabeçalho simples
      doc.font("Helvetica-Bold").fontSize(18).fillColor(primary).text("Orçamento", 50, 40);
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280")
        .text(`${safeStr(body.company?.nome,"")} • ${safeStr(body.company?.email,"")}`, 50, 60, { width:300 });
  
      // Cliente + Validade (barra lateral direita)
      const exp = tsToDate(body.customer?.expirationDate);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#111").text("Cliente", 400, 40);
      doc.font("Helvetica").fontSize(9).fillColor("#111")
        .text(safeStr(body.customer?.customerName), 400, 54, { width:160 })
        .text(safeStr(body.customer?.customerEmail), 400, 68, { width:160 })
        .text(safeStr(body.customer?.customerCellphone), 400, 82, { width:160 })
        .text(`Validade: ${formatDateBR(exp)}`, 400, 96, { width:160 });

      let y = 120;
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
  
      // Tabela compacta: Descrição | Qtd | Unit. | Líquido
      // Cabeçalho
      doc.roundedRect(50, y, 510, 22, 6).fillAndStroke("#f3f4f6", "#e5e7eb");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111")
        .text("Descrição", 60, y + 6, { width:270 })
        .text("Qtd", 340, y + 6, { width:40, align:"right" })
        .text("Unit.", 390, y + 6, { width:70, align:"right" })
        .text("Líquido", 470, y + 6, { width:80, align:"right" });
      y += 22;
  
      // Linhas
      const rows = services.slice(start, start + servicesPerPage);
      rows.forEach((it, i) => {
        const h = 18 + (String(it.name||it.label||"").length > 60 ? 10 : 0);
        if (i % 2) {
          doc.rect(50, y, 510, h).fill("#fafafa");
        }
  
        doc.font("Helvetica").fontSize(9).fillColor("#111")
          .text(String(it.name||it.label||""), 60, y + 4, { width:270 });
        doc.text(String(it.quantity||1), 340, y + 4, { width:40, align:"right" });
        doc.text(formatNumber2(it.value||0), 390, y + 4, { width:70, align:"right" });
        doc.text(formatNumber2(it.finalValue || it.totalValue || it.value || 0), 470, y + 4, { width:80, align:"right" });
        y += h;
      });
  
      // Rodapé (última)
      const isLast = (start + servicesPerPage) >= services.length;
      if (isLast) {
        y += 12;
  
        // Box total destacada
        doc.roundedRect(300, y, 260, 60, 10).fillAndStroke("#eef2ff", "#c7d2fe");
        doc.fillColor("#312e81").font("Helvetica-Bold").fontSize(10).text("Total do Orçamento", 310, y + 10, { width:120 });
        doc.fontSize(14).text(totalGeral, 0, y + 8, { width:540, align:"right" });
  
        // CTA opcional (se quiser renderizar um QR/URL de aprovação)
        // doc.roundedRect(50, y, 220, 40, 10).strokeColor("#e5e7eb").lineWidth(1).stroke();
        // doc.font("Helvetica-Bold").fontSize(10).fillColor("#111").text("Aprovar orçamento", 60, y + 12);
  
        // Assinatura linha
        const lineY = y + 80;
        doc.lineWidth(0.5).strokeColor("#d1d5db").moveTo(300, lineY).lineTo(560, lineY).stroke();
        doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(safeStr(body.company?.nome,""), 300, lineY + 6, { width:260, align:"center" });
      }
  
      // Página x/y
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(`Página ${pageNo} de ${pages}`, 50, 825, { width:510, align:"right" });
      pageNo++;
    }
  
    return finalizePDFToBase64(doc);
  };
  