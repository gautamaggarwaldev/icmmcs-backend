// import nodemailer from "nodemailer";
// import { config } from "dotenv";

// config();

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: true,
//   },
// });

// transporter
//   .verify()
//   .then(() => console.log("Email server ready to send messages"))
//   .catch((error) => {
//     console.log("Email verification error: ", error);
//     process.exit(1);
//   });


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

import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

/**
 * Prefer explicit SMTP_* vars; fall back to your existing EMAIL_* ones.
 * This keeps your current env working but lets you switch providers easily.
 */
const SMTP_HOST   = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT   = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = (process.env.SMTP_SECURE || "").toLowerCase() === "true"; // true only for 465
const EMAIL_USER   = process.env.EMAIL_USER || process.env.EMAIL_USER;
const EMAIL_PASSWORD   = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD;

// Build a pooled transporter with timeouts (prevents hanging on PaaS like Railway)
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: EMAIL_USER && EMAIL_PASSWORD ? { user:  EMAIL_USER, pass: EMAIL_PASSWORD } : undefined,
  // Connection pool for better reuse + fewer auths
  pool: (process.env.SMTP_POOL || "true").toLowerCase() === "true",
  maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 3),
  maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 50),
  // Timeouts so the app doesn’t hang forever if SMTP is blocked
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000), // 10s
  greetingTimeout:   Number(process.env.SMTP_GREETING_TIMEOUT   || 10000), // 10s
  socketTimeout:     Number(process.env.SMTP_SOCKET_TIMEOUT     || 20000), // 20s
  // If you KNOW you’re using a provider with funky TLS, you could add:
  // tls: { rejectUnauthorized: false },
});

/**
 * Optional verification on boot. Do NOT crash the app if it fails.
 * Enable only if you set EMAIL_VERIFY_ON_BOOT=true in env.
 */
(async () => {
  const verifyOnBoot = (process.env.EMAIL_VERIFY_ON_BOOT || "").toLowerCase() === "true";
  if (!verifyOnBoot) return;

  try {
    await transporter.verify();
    console.log("Email server ready to send messages");
  } catch (err) {
    console.warn("Email verification warning (continuing):", err?.message || err);
    // IMPORTANT: do not exit the process on Railway
  }
})();

/**
 * Small helper to add retry around transient SMTP errors.
 * Use in places where you currently call `transporter.sendMail(...)`.
 */
export async function sendWithRetry(mailOptions, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      lastErr = err;
      const transient = ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(err?.code);
      if (!transient || i === attempts) break;
      await new Promise(r => setTimeout(r, 1000 * i)); // simple backoff
    }
  }
  throw lastErr;
}


