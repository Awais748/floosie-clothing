import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  console.log("SEND_EMAIL: Attempting to send", { to, subject });
  console.log("SEND_EMAIL: Credentials check", {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS ? "✅ loaded" : "❌ missing",
  });

  try {
    const info = await transport.sendMail({
      from: '"FLOSSIE" <hello@flossie.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("SEND_EMAIL: Sent successfully", {
      to,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    console.error("SEND_EMAIL: Failed", { to, error: error.message });
    throw error;
  }
};
