import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { loginSchema, registerSchema } from '@shared/schemas';
import { hashPassword, verifyPassword } from '../auth/password';
import { clearAuthCookie, getTokenFromRequest, isSecureRequest, setAuthCookie, signToken, verifyToken } from '../auth/jwt';
import { createUser, findUserByEmail } from '../db/queries';
import { requireAuth, type AuthVariables } from '../auth/middleware';

const auth = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

auth.post('/register', async (c) => {
	const body = await c.req.json().catch(() => null);
	const parsed = registerSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, 400);
	}

	const existing = await findUserByEmail(c.env.DB, parsed.data.email);
	if (existing) {
		return c.json({ error: 'El email ya está registrado' }, 409);
	}

	const id = nanoid();
	const passwordHash = await hashPassword(parsed.data.password);
	const user = await createUser(c.env.DB, id, parsed.data.email, passwordHash);
	const token = await signToken(c.env, { sub: user.id, email: user.email });
	const secure = isSecureRequest(c.req.raw);

	return c.json(
		{ user: { id: user.id, email: user.email } },
		200,
		{ 'Set-Cookie': setAuthCookie(token, secure) },
	);
});

auth.post('/login', async (c) => {
	const body = await c.req.json().catch(() => null);
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, 400);
	}

	const user = await findUserByEmail(c.env.DB, parsed.data.email);
	if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
		return c.json({ error: 'Email o contraseña incorrectos' }, 401);
	}

	const token = await signToken(c.env, { sub: user.id, email: user.email });
	const secure = isSecureRequest(c.req.raw);

	return c.json(
		{ user: { id: user.id, email: user.email } },
		200,
		{ 'Set-Cookie': setAuthCookie(token, secure) },
	);
});

auth.post('/logout', requireAuth, (c) => {
	const secure = isSecureRequest(c.req.raw);
	return c.json({ ok: true }, 200, { 'Set-Cookie': clearAuthCookie(secure) });
});

auth.get('/me', async (c) => {
	const token = getTokenFromRequest(c.req.raw);
	if (!token) {
		return c.json({ user: null });
	}
	const payload = await verifyToken(c.env, token);
	if (!payload) {
		return c.json({ user: null });
	}
	return c.json({ user: { id: payload.sub, email: payload.email } });
});

export default auth;
