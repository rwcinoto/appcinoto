const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configuração do transporter usando as variáveis de ambiente
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: parseInt(process.env.EMAIL_PORT) === 465, // true para porta 465, false para outras portas
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async enviarEmailResetSenha(email, nome, token) {
    // URL do frontend - pode ser sobrescrita por variável de ambiente
    // Em produção: usa o domínio customizado numix.cinoto.com.br
    // Em desenvolvimento: usa localhost
    // Pode sobrescrever configurando FRONTEND_URL no .env ou Render
    let baseUrl = process.env.FRONTEND_URL;

    if (!baseUrl) {
      if (process.env.NODE_ENV === "production") {
        // Em produção, usa o domínio customizado
        baseUrl = "https://numix.cinoto.com.br";
      } else {
        // Em desenvolvimento, usa localhost
        baseUrl = "http://localhost:3001";
      }
    }

    const resetUrl = `${baseUrl}/resetar-senha?token=${token}`;

    // Formatar o remetente com nome e email: "Numix <email@exemplo.com>"
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = "Numix";
    const from = `${fromName} <${fromEmail}>`;

    const mailOptions = {
      from: from,
      to: email,
      subject: "Redefinição de senha - Numix",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Redefinição de senha</h1>
            </div>
            <div class="content">
              <p>Olá, ${nome}!</p>
              <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir senha</a>
              </p>
              <p>Ou copie e cole o link abaixo no seu navegador:</p>
              <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
              <p><strong>Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Olá, ${nome}!

        Recebemos uma solicitação para redefinir sua senha. Acesse o link abaixo para criar uma nova senha:

        ${resetUrl}

        Este link expira em 1 hora.

        Se você não solicitou a redefinição de senha, ignore este email.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      throw new Error("Erro ao enviar email de redefinição de senha");
    }
  }
}

module.exports = new EmailService();
