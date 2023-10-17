const { jsPDF } = require("jspdf");

module.exports = () => {

const doc = new jsPDF();
doc.text("Bem vindo", 10, 10);
doc.save('/temp/orcamento.pdf');

}