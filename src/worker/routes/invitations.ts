import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';
import { createInvitationSchema, updateInvitationSchema } from '@shared/schemas';
import {
	createInvitation,
	deleteInvitation,
	findInvitationById,
	findTemplateById,
	listInvitationsByUser,
	slugExists,
	updateInvitation,
} from '../db/queries';
import { requireAuth, type AuthVariables } from '../auth/middleware';

const generateSlug = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

const invitations = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

invitations.use('*', requireAuth);

function resolveAppUrl(c: Parameters<typeof invitations.get>[1] extends (ctx: infer T) => any ? T : never): string {
	const requestOrigin = new URL(c.req.url).origin;
	const appOrigin = new URL(c.env.APP_URL).origin;

	if (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:')) {
		return requestOrigin;
	}

	return appOrigin;
}

invitations.get('/', async (c) => {
	const appUrl = resolveAppUrl(c);
	const items = await listInvitationsByUser(c.env.DB, c.get('userId'));
	return c.json({
		invitations: items.map((inv) => ({
			...inv,
			config: JSON.parse(inv.config),
			public_url: inv.public_slug ? `${appUrl}/i/${inv.public_slug}` : null,
		})),
	});
});

invitations.post('/', async (c) => {
	const body = await c.req.json().catch(() => null);
	const parsed = createInvitationSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, 400);
	}

	const template = await findTemplateById(c.env.DB, parsed.data.template_id);
	if (!template) {
		return c.json({ error: 'Plantilla no encontrada' }, 404);
	}

	const inv = await createInvitation(c.env.DB, {
		id: nanoid(),
		userId: c.get('userId'),
		templateId: template.id,
		title: parsed.data.title ?? 'Mi invitación',
		hostName: parsed.data.host_name ?? '',
		config: template.default_config,
	});

	return c.json({ invitation: { ...inv, config: JSON.parse(inv.config) } }, 201);
});

invitations.get('/:id', async (c) => {
	const appUrl = resolveAppUrl(c);
	const inv = await findInvitationById(c.env.DB, c.req.param('id'), c.get('userId'));
	if (!inv) return c.json({ error: 'Invitación no encontrada' }, 404);
	return c.json({
		invitation: {
			...inv,
			config: JSON.parse(inv.config),
			public_url: inv.public_slug ? `${appUrl}/i/${inv.public_slug}` : null,
		},
	});
});

invitations.patch('/:id', async (c) => {
	const appUrl = resolveAppUrl(c);
	const body = await c.req.json().catch(() => null);
	const parsed = updateInvitationSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, 400);
	}

	const existing = await findInvitationById(c.env.DB, c.req.param('id'), c.get('userId'));
	if (!existing) return c.json({ error: 'Invitación no encontrada' }, 404);

	if (parsed.data.template_id) {
		const template = await findTemplateById(c.env.DB, parsed.data.template_id);
		if (!template) return c.json({ error: 'Plantilla no encontrada' }, 404);
	}

	const fields: Record<string, unknown> = {};
	if (parsed.data.title !== undefined) fields.title = parsed.data.title;
	if (parsed.data.host_name !== undefined) fields.host_name = parsed.data.host_name;
	if (parsed.data.event_date !== undefined) fields.event_date = parsed.data.event_date;
	if (parsed.data.event_end_date !== undefined) fields.event_end_date = parsed.data.event_end_date;
	if (parsed.data.timezone !== undefined) fields.timezone = parsed.data.timezone;
	if (parsed.data.location !== undefined) fields.location = parsed.data.location;
	if (parsed.data.message !== undefined) fields.message = parsed.data.message;
	if (parsed.data.template_id !== undefined) fields.template_id = parsed.data.template_id;
	if (parsed.data.config !== undefined) fields.config = JSON.stringify(parsed.data.config);

	const updated = await updateInvitation(c.env.DB, c.req.param('id'), c.get('userId'), fields);
	return c.json({
		invitation: {
			...updated,
			config: JSON.parse(updated!.config),
			public_url: updated!.public_slug ? `${appUrl}/i/${updated!.public_slug}` : null,
		},
	});
});

invitations.delete('/:id', async (c) => {
	const ok = await deleteInvitation(c.env.DB, c.req.param('id'), c.get('userId'));
	if (!ok) return c.json({ error: 'Invitación no encontrada' }, 404);
	return c.json({ ok: true });
});

invitations.post('/:id/publish', async (c) => {
	const appUrl = resolveAppUrl(c);
	const inv = await findInvitationById(c.env.DB, c.req.param('id'), c.get('userId'));
	if (!inv) return c.json({ error: 'Invitación no encontrada' }, 404);

	if (!inv.title?.trim()) {
		return c.json({ error: 'La invitación debe tener un título antes de publicar' }, 400);
	}

	let slug = inv.public_slug;
	if (!slug) {
		let attempts = 0;
		do {
			slug = generateSlug();
			attempts++;
		} while ((await slugExists(c.env.DB, slug)) && attempts < 10);
		if (attempts >= 10) {
			return c.json({ error: 'No se pudo generar un enlace único' }, 500);
		}
	}

	const updated = await updateInvitation(c.env.DB, inv.id, c.get('userId'), {
		status: 'published',
		public_slug: slug,
	});

	return c.json({
		invitation: {
			...updated,
			config: JSON.parse(updated!.config),
			public_url: `${appUrl}/i/${slug}`,
		},
	});
});

export default invitations;
