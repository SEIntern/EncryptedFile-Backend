import { transporter } from "../config/email.js";

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw error;
  }
};
