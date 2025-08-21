const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const { createPDF } = require("./src/services/pdf/factory");

const createContactMail = require("./src/services/createContactMail");
const sendMail = require("./src/services/sendMail");
const validateHash = require("./src/services/validateHash");
const app = express();

app.use(cors("*"));
app.use(express.json());

app.post("/build", async (req, res) => {
  const isAuth = await validateHash(req);
  if (!isAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // lê o modelo do query OU do body; default = 0 (normal)
    const modelParam = req.query.model ?? req.body.model ?? 0;
    // o body que os templates esperam continua sendo req.body
    // se você mandar model dentro do body, NÃO precisa removê-lo: os templates ignoram.
    const pdfBase64 = await createPDF(req.body, modelParam);

    return res.status(200).json({ pdfBase64 });
  } catch (error) {
    console.error("Erro ao criar o PDF:", error);
    return res.status(500).json({ error: "Erro ao criar o PDF" });
  }
});

app.post("/send", async (req, res) => {
  const isAuth = await validateHash(req);

  if (!isAuth) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const modelParam = req.query.model ?? req.body.model ?? 0;

  const pdf = await createPDF(req.body, modelParam);
  require("./mailService")(
    req.body.company.nome,
    req.body.customer.customerName,
    "",
    req.body.customer.customerEmail,
    "",
    "",
    "",
    req.body.customer.totalValue,
    pdf,
    req.body.budgetId
  )
    .then((response) => res.status(200).json({ message: "E-mail enviado" }))
    .catch((error) => res.status(400).json(error));
});

app.post("/send-contact-mail", async (req, res) => {
  const isAuth = await validateHash(req);

  if (!isAuth) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const info = createContactMail(req.body);

  return sendMail(info)
    .then((response) => res.status(200).json({ message: "E-mail enviado" }))
    .catch((error) => res.status(400).json(error));
});

//produtoção
// app.listen(3000, () => {
  // //homologação
  app.listen(3010, () => {
  console.log("Servidor Iniciado");
});
