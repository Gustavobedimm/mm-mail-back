// IMPORTS dos templates (ou deixe como funções que fazem require dinâmico)
const classico = require("../../templates/tplPrincipal"); // 0 (default)
const moderno = require("../../templates/04"); // 1
const detalhado = require("../../templates/02"); // 2
const compacto = require("../../templates/05"); // 3

// Registry: aceita número ou string
const REGISTRY = {
  0: classico,
  1: moderno,
  2: detalhado,
  3: compacto,

  // aliases por string (opcional)
  classico: classico,
  moderno: moderno,
  detalhado: detalhado,
  compacto: compacto,
};

function pickRenderer(modelParam) {
  // normaliza: "3" -> 3; "modern" -> "modern"
  let key = modelParam;
  if (key === undefined || key === null || key === "") return 0;

  // tenta número
  const asNumber = Number(key);
  if (!Number.isNaN(asNumber) && REGISTRY[asNumber]) return REGISTRY[asNumber];

  // tenta string (lowercase)
  const asString = String(key).toLowerCase();
  if (REGISTRY[asString]) return REGISTRY[asString];

  // fallback
  return REGISTRY[0];
}

async function createPDF(body, model) {
  const render = pickRenderer(model);
  return render(body); // cada template retorna base64
}

module.exports = { createPDF };
