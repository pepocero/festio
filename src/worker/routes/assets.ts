import { Hono } from 'hono';

const assets = new Hono<{ Bindings: Env }>();

assets.get('/*', async (c) => {
	const key = c.req.path.replace(/^\/media\//, '');
	if (!key || key.includes('..')) {
		return c.text('No encontrado', 404);
	}

	const object = await c.env.ASSETS.get(key);
	if (!object) {
		return c.text('No encontrado', 404);
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Access-Control-Allow-Origin', '*');

	return new Response(object.body, { headers });
});

export default assets;
