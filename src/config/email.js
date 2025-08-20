import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// export let transport = nodemailer.createTransport({
//   service: "Outlook365",
//   host: "smtp.office365.com",
//   port: "587",
//   secure: false, // Required for STARTTLS
//   tls: {
//     ciphers: "SSLv3",
//     rejectUnauthorized: false, // Prevents certificate validation errors
//   },
//   auth: {
//     user: process.env.EMAIL_ID, // Your Outlook email
//     pass: process.env.PASSWORD_EMAIL, // Use App Password if needed
//   },
// });

transporter
  .verify()
  .then(() => console.log("Email server ready to send messages"))
  .catch((error) => {
    console.log("Email verification error: ", error);
    process.exit(1);
  });
