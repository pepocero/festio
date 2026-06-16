import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from '@shared/utils';
import { createAsset } from '../db/queries';
import { requireAuth, type AuthVariables } from '../auth/middleware';

const uploads = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

uploads.post('/', requireAuth, async (c) => {
	const formData = await c.req.formData().catch(() => null);
	if (!formData) {
		return c.json({ error: 'Formulario inválido' }, 400);
	}

	const file = formData.get('file');
	if (!(file instanceof File)) {
		return c.json({ error: 'Archivo requerido' }, 400);
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
		return c.json({ error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP.' }, 400);
	}

	if (file.size > MAX_UPLOAD_BYTES) {
		return c.json({ error: 'El archivo supera el límite de 5 MB' }, 400);
	}

	const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
	const userId = c.get('userId');
	const assetId = nanoid();
	const r2Key = `users/${userId}/${assetId}.${ext}`;

	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);

	// Validación básica de magic bytes
	if (!isValidImage(bytes, file.type)) {
		return c.json({ error: 'El contenido del archivo no coincide con su tipo' }, 400);
	}

	await c.env.ASSETS.put(r2Key, buffer, {
		httpMetadata: { contentType: file.type },
	});

	await createAsset(c.env.DB, {
		id: assetId,
		userId,
		r2Key,
		mimeType: file.type,
		sizeBytes: file.size,
	});

	return c.json({
		asset: {
			id: assetId,
			url: `${c.env.APP_URL}/media/${r2Key}`,
			r2_key: r2Key,
		},
	});
});

function isValidImage(bytes: Uint8Array, mime: string): boolean {
	if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
	if (mime === 'image/png') {
		return (
			bytes[0] === 0x89 &&
			bytes[1] === 0x50 &&
			bytes[2] === 0x4e &&
			bytes[3] === 0x47
		);
	}
	if (mime === 'image/webp') {
		return (
			bytes[0] === 0x52 &&
			bytes[1] === 0x49 &&
			bytes[2] === 0x46 &&
			bytes[3] === 0x46 &&
			bytes[8] === 0x57 &&
			bytes[9] === 0x45 &&
			bytes[10] === 0x42 &&
			bytes[11] === 0x50
		);
	}
	return false;
}

export default uploads;
