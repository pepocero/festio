import { SignJWT, jwtVerify } from 'jose';
import { AUTH_COOKIE, JWT_EXPIRY } from '@shared/utils';

export interface JwtPayload {
	sub: string;
	email: string;
}

function getSecret(env: Env): Uint8Array {
	const secret = env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET no configurado');
	}
	return new TextEncoder().encode(secret);
}

export async function signToken(env: Env, payload: JwtPayload): Promise<string> {
	return new SignJWT({ email: payload.email })
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(payload.sub)
		.setIssuedAt()
		.setExpirationTime(JWT_EXPIRY)
		.sign(getSecret(env));
}

export async function verifyToken(env: Env, token: string): Promise<JwtPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret(env));
		if (!payload.sub) return null;
		return {
			sub: payload.sub,
			email: (payload.email as string) ?? '',
		};
	} catch {
		return null;
	}
}

export function setAuthCookie(token: string, isSecure: boolean): string {
	const parts = [
		`${AUTH_COOKIE}=${token}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		`Max-Age=${7 * 24 * 60 * 60}`,
	];
	if (isSecure) parts.push('Secure');
	return parts.join('; ');
}

export function clearAuthCookie(isSecure: boolean): string {
	const parts = [`${AUTH_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
	if (isSecure) parts.push('Secure');
	return parts.join('; ');
}

export function getTokenFromRequest(request: Request): string | null {
	const cookie = request.headers.get('Cookie');
	if (!cookie) return null;
	const match = cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`));
	return match?.[1] ?? null;
}

export function isSecureRequest(request: Request): boolean {
	const url = new URL(request.url);
	return url.protocol === 'https:' || url.hostname === 'localhost';
}
