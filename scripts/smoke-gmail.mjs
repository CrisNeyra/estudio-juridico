import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;
const to = process.env.CONTACT_TO_EMAIL;
const from = process.env.CONTACT_FROM_EMAIL ?? `Estudio <${user}>`;

if (!user || !pass || !to) {
  console.error("Faltan GMAIL_USER, GMAIL_APP_PASSWORD o CONTACT_TO_EMAIL");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

await transporter.verify();
await transporter.sendMail({
  from,
  to,
  subject: "Prueba SMTP estudio-juridico",
  text: "Prueba OK desde local. Si ves este mail, Gmail SMTP funciona.",
});
console.log("SMTP_OK ->", to);
