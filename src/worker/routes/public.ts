import { Hono } from 'hono';
import { findPublishedInvitationBySlug } from '../db/queries';
import { renderPublicInvitationHtml } from '../templates/render';

const publicRoutes = new Hono<{ Bindings: Env }>();

publicRoutes.get('/:slug', async (c) => {
	const slug = c.req.param('slug');
	const invitation = await findPublishedInvitationBySlug(c.env.DB, slug);

	if (!invitation) {
		return c.html(
			`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>No encontrada</title></head><body><h1>Invitación no encontrada</h1><p>El enlace puede haber expirado o ser incorrecto.</p></body></html>`,
			404,
			{
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
			},
		);
	}

	const html = renderPublicInvitationHtml({
		invitation,
		templateDefaultConfig: invitation.template_default_config,
		appUrl: c.env.APP_URL,
	});

	return c.html(html, 200, {
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'Cache-Control': 'public, max-age=60',
	});
});

export default publicRoutes;
