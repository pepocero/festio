import { Hono } from 'hono';
import { listTemplates } from '../db/queries';
import { requireAuth, type AuthVariables } from '../auth/middleware';

const templates = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

templates.get('/', requireAuth, async (c) => {
	const items = await listTemplates(c.env.DB);
	return c.json({
		templates: items.map((t) => ({
			id: t.id,
			slug: t.slug,
			name: t.name,
			category: t.category,
			default_config: JSON.parse(t.default_config),
			preview_image_key: t.preview_image_key,
		})),
	});
});

export default templates;
