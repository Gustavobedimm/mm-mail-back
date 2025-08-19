
// IMPORTS dos templates (ou deixe como funções que fazem require dinâmico)
const tplPrincipal        = require("./src/templates/tplPrincipal");        // 0 (default)
const tplModernFaixa      = require("./src/templates/01");     // 1
const tplCompacto        = require("./src/templates/02");         // 2
const tplArtsy           = require("./src/templates/03");            // 3
const tplCorporateGreen   = require("./src/templates/04");
const tplCorporate  = require("./src/templates/05");  // 4
// Se tiver mais, continue mapeando...

// Registry: aceita número ou string
const REGISTRY = {
  0: tplPrincipal,
  1: tplModernFaixa,
  2: tplCompacto,
  3: tplArtsy,
  4: tplCorporateGreen,
  5: tplCorporate,

  // aliases por string (opcional)
  normal: tplPrincipal,
  modern: tplModernFaixa,
  compacto: tplCompacto,
  artsy: tplArtsy,
  corporate: tplCorporateGreen,
  corporate2: tplCorporate,
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

/**
 * Cria o PDF base64 usando o template escolhido.
 * @param {object} body - payload do seu PDF (company, customer, services, etc.)
 * @param {number|string} model - opcional: 0/1/2/3/4... ou "modern"/"compacto"/...
 * @returns {Promise<string>} base64 do PDF
 */
async function createPDF(body, model) {
  const render = pickRenderer(model);
  return render(body); // cada template retorna base64
}

module.exports = { createPDF };
