// === backend/controllers/webhooks/langflowWebhookController.js ===
import * as templateService from '../../services/templateService.js';
import { ok } from '../../utils/httpResponse.js';
import { requireFields } from '../../utils/validators.js';
import { logEvent } from '../../middlewares/logger.js';

/**
 * POST /api/webhooks/langflow
 * Recibe una plantilla generada por LangFlow de forma asíncrona y la persiste.
 * Body esperado: { name?, subject, body_html, category?, difficulty_level?, target_department_id? }
 */
export async function receiveTemplate(req, res, next) {
  try {
    requireFields(req.body, ['subject', 'body_html']);
    const template = await templateService.createTemplate({
      name: req.body.name || `LangFlow - ${new Date().toISOString()}`,
      subject: req.body.subject,
      body_html: req.body.body_html,
      category: req.body.category || 'urgency',
      difficulty_level: req.body.difficulty_level || 'medium',
      target_department_id: req.body.target_department_id ?? null,
      generated_by: 'langflow',
    });
    await logEvent({
      eventType: 'template_received',
      actor: 'langflow',
      relatedTable: 'templates',
      relatedId: template.id,
      description: `Plantilla recibida desde LangFlow: ${template.name}`,
    });
    ok(res, template, 201);
  } catch (err) {
    next(err);
  }
}// Procesa la plantilla recibida desde LangFlow.
