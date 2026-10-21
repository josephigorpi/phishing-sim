// === backend/controllers/webhooks/trackingWebhookController.js ===
import * as trackingService from '../../services/trackingService.js';
import { env } from '../../config/env.js';
import { logEvent } from '../../middlewares/logger.js';
import { ok, HttpError } from '../../utils/httpResponse.js';

// GIF 1x1 transparente para pixel de apertura
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// GET /api/webhooks/tracking/:token/open
export async function trackOpen(req, res) {
  try {
    const { token } = req.params;
    const updated = await trackingService.markOpened(token);
    if (updated) {
      await logEvent({
        eventType: 'email_opened',
        actor: 'webhook',
        relatedTable: 'campaign_results',
        relatedId: updated.id,
        description: `Apertura registrada para token ${token}`,
      });
    }
  } catch (err) {
    // El pixel nunca debe fallar visiblemente
    console.error('[trackOpen]', err.message);
  } finally {
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.status(200).send(PIXEL_GIF);
  }
}

// GET /api/webhooks/tracking/:token/click
export async function trackClick(req, res, next) {
  try {
    const { token } = req.params;
    const updated = await trackingService.markClicked(token);
    if (updated) {
      await logEvent({
        eventType: 'click_detected',
        actor: 'webhook',
        relatedTable: 'campaign_results',
        relatedId: updated.id,
        description: `Clic registrado para token ${token}`,
      });
    }
    // Redirigir SIEMPRE a la página educativa (nunca a phishing real)
    const redirectUrl = `${env.educationalRedirectUrl}?t=${encodeURIComponent(token)}`;
    res.redirect(302, redirectUrl);
  } catch (err) {
    next(err);
  }
}

// POST /api/webhooks/tracking/:token/report
export async function trackReport(req, res, next) {
  try {
    const { token } = req.params;
    const updated = await trackingService.markReported(token);
    if (!updated) throw new HttpError('Token no encontrado', 404);
    await logEvent({
      eventType: 'reported_as_suspicious',
      actor: 'user',
      relatedTable: 'campaign_results',
      relatedId: updated.id,
      description: `El usuario reportó el correo como sospechoso (token ${token}).`,
    });
    ok(res, { reported: true, result_id: updated.id });
  } catch (err) {
    next(err);
  }
}
