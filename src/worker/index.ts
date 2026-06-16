import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import templatesRoutes from './routes/templates';
import invitationsRoutes from './routes/invitations';
import uploadsRoutes from './routes/uploads';
import assetsRoutes from './routes/assets';
import publicRoutes from './routes/public';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', async (c, next) => {
	const origin = c.req.header('Origin') ?? '';
	const appUrl = new URL(c.env.APP_URL);
	const allowed =
		origin === appUrl.origin ||
		origin.startsWith('http://localhost:') ||
		origin.startsWith('http://127.0.0.1:');

	return cors({
		origin: allowed ? origin : appUrl.origin,
		credentials: true,
		allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type'],
	})(c, next);
});

app.route('/api/auth', authRoutes);
app.route('/api/templates', templatesRoutes);
app.route('/api/invitations', invitationsRoutes);
app.route('/api/uploads', uploadsRoutes);
app.route('/media', assetsRoutes);
app.route('/i', publicRoutes);

app.get('/api/health', (c) => c.json({ ok: true }));

export default app;
