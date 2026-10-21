// === backend/services/emailService.js ===
import { resend } from '../config/resendClient.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpResponse.js';

/**
 * Construye el HTML final del correo simulado.
 * - Inyecta el link de tracking de clic en {{tracking_link}} si existe.
 * - Si no existe, agrega un botón CTA al final.
 * - Añade el pixel 1x1 de tracking de apertura.
 */
export function buildEmailHtml({ templateBodyHtml, trackingToken, backendPublicUrl }) {
  const clickUrl = `${backendPublicUrl}/api/webhooks/tracking/${trackingToken}/click`;
  const reportUrl = `${backendPublicUrl}/api/webhooks/tracking/${trackingToken}/report`;
  const openPixel = `<img src="${backendPublicUrl}/api/webhooks/tracking/${trackingToken}/open" width="1" height="1" alt="" style="display:none" />`;

  let html = templateBodyHtml || '';
  if (html.includes('{{tracking_link}}')) {
    html = html.replaceAll('{{tracking_link}}', clickUrl);
  } else {
    html += `
      <p style="margin-top:20px">
        <a href="${clickUrl}" style="background:#0d6efd;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Acceder</a>
      </p>`;
  }
  // Botón "reportar" (siempre disponible como texto discreto)
  html += `
    <p style="margin-top:24px;font-size:11px;color:#888">
      ¿No esperabas este correo? <a href="${reportUrl}" style="color:#888">Repórtalo como sospechoso</a>.
    </p>`;
  html += openPixel;
  return html;
}

export async function sendSimulationEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${env.resendFromName} <${env.resendFromEmail}>`,
      to: [to],
      subject,
      html,
    });
    if (error) throw new HttpError(`Resend error: ${error.message}`, 502);
    return data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(`Error enviando correo: ${err.message}`, 502);
  }
}
