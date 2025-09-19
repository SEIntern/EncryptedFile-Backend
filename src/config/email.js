import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP: { host, port, auth }
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
console.log(process.env.SMTP_USER, process.env.SMTP_PASS);
// verify connection
transporter.verify((err, success) => {
  if (err) {
    console.error("Nodemailer connection error:", err);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});
