const PDFDocument = require("pdfkit");

// Meses PT-BR
const months = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const EXCLUDED_FIELDS = [
  "sendedAt","viewedAt","sended","statusBudget","primaryColor","expirationDate",
  "discountPercentage","discountValue","finalValue","id","updateAt",
];

const STANDARD_FIELDS = [
  "companyId","services","customerEmail","customerDocument","customerCellphone",
  "customerName","obs","totalValue","createdAt","viewed",
];

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat("pt-BR",{ style:"currency", currency:"BRL" }).format(Number(value||0));
}
function formatNumber2(value) {
  return new Intl.NumberFormat("pt-BR",{ minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value||0));
}

function safeStr(s, fallback="Não informado") {
  if (!s) return fallback;
  const t = String(s).trim();
  return t.length ? t : fallback;
}

function tsToDate(ts, fallbackNow=true) {
  if (!ts) return fallbackNow ? new Date() : null;
  // aceita Timestamp Firestore {seconds, nanoseconds} ou Date/string
  if (typeof ts === "object" && typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? (fallbackNow ? new Date() : null) : d;
}

function formatDateBR(d) {
  try {
    return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {
    return new Intl.DateTimeFormat("pt-BR").format(new Date());
  }
}

function formatLongDate(d) {
  const dia = d.getDate();
  const mes = months[d.getMonth()];
  const ano = d.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
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

async function loadRemoteImageToBuffer(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

function finalizePDFToBase64(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    doc.on("error", reject);
    doc.end();
  });
}

function beginDoc({ size="A4", margin=0, autoFirstPage=false } = {}) {
  return new PDFDocument({ size, margins:{ top:0, left:0, right:0, bottom:0 }, autoFirstPage });
}

module.exports = {
  months,
  formatCurrencyBRL,
  formatNumber2,
  formatDateBR,
  formatLongDate,
  tsToDate,
  safeStr,
  getExtraFields,
  loadRemoteImageToBuffer,
  beginDoc,
  finalizePDFToBase64,
};
