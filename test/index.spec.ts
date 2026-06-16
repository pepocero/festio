import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/worker/index';

describe('Invitaciones worker', () => {
	it('/api/health responde ok (unit style)', async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/api/health');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});

	it('/api/health responde ok (integration style)', async () => {
		const request = new Request('http://example.com/api/health');
		const response = await SELF.fetch(request);
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});
});
