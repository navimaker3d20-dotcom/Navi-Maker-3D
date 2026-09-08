import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Navi Maker 3D <no-reply@navimaker3d.com>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recupera tu contraseña — Navi Maker 3D",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetUrl}">Haz clic aquí para crear una nueva contraseña</a></p>
      <p>Este enlace expira en 1 hora. Si tú no lo solicitaste, ignora este correo.</p>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "¡Bienvenido a Navi Maker 3D!",
    html: `<p>Hola ${name}, gracias por registrarte. Ya puedes explorar el catálogo y personalizar tu primera figura.</p>`,
  });
}
