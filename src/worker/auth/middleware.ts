import { createMiddleware } from 'hono/factory';
import type { JwtPayload } from './jwt';
import { getTokenFromRequest, verifyToken } from './jwt';

export type AuthVariables = {
	userId: string;
	userEmail: string;
	jwtPayload: JwtPayload;
};

export const requireAuth = createMiddleware<{
	Bindings: Env;
	Variables: AuthVariables;
}>(async (c, next) => {
	const token = getTokenFromRequest(c.req.raw);
	if (!token) {
		return c.json({ error: 'No autenticado' }, 401);
	}
	const payload = await verifyToken(c.env, token);
	if (!payload) {
		return c.json({ error: 'Sesión inválida o expirada' }, 401);
	}
	c.set('userId', payload.sub);
	c.set('userEmail', payload.email);
	c.set('jwtPayload', payload);
	await next();
});

export const optionalAuth = createMiddleware<{
	Bindings: Env;
	Variables: Partial<AuthVariables>;
}>(async (c, next) => {
	const token = getTokenFromRequest(c.req.raw);
	if (token) {
		const payload = await verifyToken(c.env, token);
		if (payload) {
			c.set('userId', payload.sub);
			c.set('userEmail', payload.email);
			c.set('jwtPayload', payload);
		}
	}
	await next();
});
