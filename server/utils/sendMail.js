import nodemailer from 'nodemailer';

/**
 * Sends an email using SMTP transport settings defined in environment variables.
 * Can be used with standard SMTP hosts like Gmail, Zoho, Mailgun, etc.
 * 
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
export const sendMail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // default fallback to Gmail SMTP
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER || 'PriceRadar'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully dispatched to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to dispatch email alert to ${to}:`, error.message);
    throw error;
  }
};
