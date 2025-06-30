require("dotenv").config();

module.exports = ({ budgetId, nome, empresaNome }) => {
  return `<!DOCTYPE html>
  <html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; background-color: #f9f9f9; margin: 0; padding: 10px 10px;">
    <img src="${process.env.API_URL}/api/rastreamento-email?budgetId=${budgetId}" width="1" height="1" alt="Rastreamento orçarjá" style="display: block;" />

    <table style="width: 100%; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <tr>
        <td>
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Olá, ${nome}!</h2>

          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            Segue em anexo o orçamento solicitado.
          </p>

          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            Atenciosamente,<br />
            <strong>Equipe ${empresaNome}</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
            Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
