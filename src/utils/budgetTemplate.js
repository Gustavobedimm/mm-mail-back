require("dotenv").config();

module.exports = ({ budgetId, nome, empresaNome }) => {
  return `<!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
    <img src="${process.env.API_URL}/api/rastreamento-email?budgetId=${budgetId}" width="1" height="1" alt=""/>
      <h2>Olá, ${nome}!</h2>
  
      <p>Segue em anexo o orçamento solicitado.</p>
  
      <p>Qualquer dúvida, estamos à disposição.</p>
  
      <p>Atenciosamente,<br><strong>Equipe ${empresaNome}</strong></p>
  
      <hr>
      <p style="font-size: 12px; color: #777;">Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.</p>
    </body>
  </html>`;
};
