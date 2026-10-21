// === backend/controllers/webhooks/n8nWebhookController.js ===
import * as campaignService from '../../services/campaignService.js';
import * as userService from '../../services/userService.js';
import * as templateService from '../../services/templateService.js';
import * as trackingService from '../../services/trackingService.js';
import * as langflowService from '../../services/langflowService.js';
import * as emailService from '../../services/emailService.js';
import { supabase } from '../../config/supabaseClient.js';
import { env } from '../../config/env.js';
import { ok } from '../../utils/httpResponse.js';
import { logEvent } from '../../middlewares/logger.js';

/**
 * POST /api/webhooks/n8n
 * Disparo mensual desde n8n. Orquesta:
 *   1. Crear/reutilizar campaña.
 *   2. Traer usuarios activos.
 *   3. Por usuario: historial -> plantilla (LangFlow o fallback BD) -> result + token -> email.
 *   4. Marcar campaña como 'sent'.
 */
export async function triggerMonthlyCampaign(req, res, next) {
  try {
    const body = req.body || {};
    const campaignName =
      body.campaign_name ||
      `Campaña mensual ${new Date().toISOString().slice(0, 7)}`;

    // 1. Campaña
    const campaign = body.campaign_id
      ? await campaignService.getCampaignById(body.campaign_id)
      : await campaignService.createCampaign({ name: campaignName, status: 'scheduled' });

    await logEvent({
      eventType: 'n8n_campaign_triggered',
      actor: 'n8n',
      relatedTable: 'campaigns',
      relatedId: campaign.id,
      description: `Campaña disparada desde n8n: ${campaign.name}`,
    });

    // 2. Usuarios activos
    const users = await userService.getActiveUsersForCampaign();
    if (users.length === 0) {
      return ok(res, {
        campaign_id: campaign.id,
        sent: 0,
        message: 'No hay usuarios activos',
      });
    }

    // Cache de departamentos para evitar N consultas
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name');
    const deptById = new Map((departments || []).map((d) => [d.id, d]));

    const summary = {
      campaign_id: campaign.id,
      total_users: users.length,
      sent: 0,
      failed: [],
      results: [],
    };

    // 3. Procesar cada usuario
    for (const user of users) {
      try {
        const department = user.department_id
          ? deptById.get(user.department_id)
          : null;
        const history = await userService.getUserHistory(user.id);

        // 3a. Pedir plantilla a LangFlow (puede devolver null -> fallback)
        let adapted = null;
        try {
          adapted = await langflowService.requestAdaptedTemplate({
            user,
            department,
            lastResults: history,
          });
        } catch (lfErr) {
          console.warn(
            `[n8n] LangFlow falló para user ${user.id}: ${lfErr.message}. Usando fallback.`
          );
        }

        // 3b. Persistir plantilla generada o reusar una de BD
        let template;
        if (adapted) {
          template = await templateService.createTemplate({
            name: adapted.name || `Auto - ${user.full_name}`,
            subject: adapted.subject,
            body_html: adapted.body_html,
            category: adapted.category || 'urgency',
            difficulty_level: adapted.difficulty_level || 'medium',
            target_department_id: user.department_id ?? null,
            generated_by: 'langflow',
          });
        } else {
          const { items } = await templateService.listTemplates({
            departmentId: user.department_id,
            limit: 1,
          });
          template = items[0] || null;
        }

        if (!template) {
          summary.failed.push({ user_id: user.id, reason: 'Sin plantilla disponible' });
          continue;
        }

        // 3c. Crear campaign_result con token único
        const result = await trackingService.createCampaignResult({
          campaignId: campaign.id,
          userId: user.id,
          templateId: template.id,
        });

        // 3d. Enviar correo con link de tracking inyectado
        const html = emailService.buildEmailHtml({
          templateBodyHtml: template.body_html,
          trackingToken: result.tracking_token,
          backendPublicUrl: env.backendPublicUrl,
        });

        await emailService.sendSimulationEmail({
          to: user.email,
          subject: template.subject,
          html,
        });

        await trackingService.markSent(result.tracking_token);
        await logEvent({
          eventType: 'email_sent',
          actor: 'backend',
          relatedTable: 'campaign_results',
          relatedId: result.id,
          description: `Correo simulado enviado a ${user.email}`,
        });

        summary.sent += 1;
        summary.results.push({
          user_id: user.id,
          result_id: result.id,
          tracking_token: result.tracking_token,
        });
      } catch (userErr) {
        console.error(`[n8n] Error procesando user ${user.id}:`, userErr.message);
        summary.failed.push({ user_id: user.id, reason: userErr.message });
      }
    }

    // 4. Marcar campaña como 'sent'
    await campaignService.updateCampaignStatus(campaign.id, 'sent');
    await logEvent({
      eventType: 'campaign_sent',
      actor: 'backend',
      relatedTable: 'campaigns',
      relatedId: campaign.id,
      description: `Campaña ${campaign.name} enviada a ${summary.sent} usuarios.`,
    });

    ok(res, summary);
  } catch (err) {
    next(err);
  }
}
