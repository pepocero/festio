import type { Invitation, InvitationWithTemplate, Template, User } from '@shared/types';

export async function findUserByEmail(db: D1Database, email: string): Promise<User | null> {
	return db
		.prepare('SELECT * FROM users WHERE email = ?')
		.bind(email)
		.first<User>();
}

export async function findUserById(db: D1Database, id: string): Promise<User | null> {
	return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
}

export async function createUser(
	db: D1Database,
	id: string,
	email: string,
	passwordHash: string,
): Promise<User> {
	await db
		.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
		.bind(id, email, passwordHash)
		.run();
	const user = await findUserById(db, id);
	if (!user) throw new Error('Error al crear usuario');
	return user;
}

export async function listTemplates(db: D1Database): Promise<Template[]> {
	const result = await db.prepare('SELECT * FROM templates ORDER BY category, name').all<Template>();
	return result.results ?? [];
}

export async function findTemplateById(db: D1Database, id: string): Promise<Template | null> {
	return db.prepare('SELECT * FROM templates WHERE id = ?').bind(id).first<Template>();
}

export async function listInvitationsByUser(
	db: D1Database,
	userId: string,
): Promise<InvitationWithTemplate[]> {
	const result = await db
		.prepare(
			`SELECT i.*, t.name as template_name, t.category as template_category
       FROM invitations i
       JOIN templates t ON t.id = i.template_id
       WHERE i.user_id = ?
       ORDER BY i.updated_at DESC`,
		)
		.bind(userId)
		.all<InvitationWithTemplate>();
	return result.results ?? [];
}

export async function findInvitationById(
	db: D1Database,
	id: string,
	userId: string,
): Promise<Invitation | null> {
	return db
		.prepare('SELECT * FROM invitations WHERE id = ? AND user_id = ?')
		.bind(id, userId)
		.first<Invitation>();
}

export async function findPublishedInvitationBySlug(
	db: D1Database,
	slug: string,
): Promise<(Invitation & { template_default_config: string }) | null> {
	return db
		.prepare(
			`SELECT i.*, t.default_config as template_default_config
       FROM invitations i
       JOIN templates t ON t.id = i.template_id
       WHERE i.public_slug = ? AND i.status = 'published'`,
		)
		.bind(slug)
		.first<Invitation & { template_default_config: string }>();
}

export async function createInvitation(
	db: D1Database,
	data: {
		id: string;
		userId: string;
		templateId: string;
		title: string;
		hostName: string;
		config: string;
	},
): Promise<Invitation> {
	await db
		.prepare(
			`INSERT INTO invitations (id, user_id, template_id, title, host_name, config)
       VALUES (?, ?, ?, ?, ?, ?)`,
		)
		.bind(data.id, data.userId, data.templateId, data.title, data.hostName, data.config)
		.run();
	const inv = await findInvitationById(db, data.id, data.userId);
	if (!inv) throw new Error('Error al crear invitación');
	return inv;
}

export async function updateInvitation(
	db: D1Database,
	id: string,
	userId: string,
	fields: Record<string, unknown>,
): Promise<Invitation | null> {
	const allowed = [
		'title',
		'host_name',
		'event_date',
		'event_end_date',
		'timezone',
		'location',
		'message',
		'config',
		'template_id',
		'status',
		'public_slug',
	] as const;

	const sets: string[] = [];
	const values: unknown[] = [];

	for (const key of allowed) {
		if (key in fields) {
			sets.push(`${key} = ?`);
			values.push(fields[key]);
		}
	}

	if (sets.length === 0) {
		return findInvitationById(db, id, userId);
	}

	sets.push("updated_at = datetime('now')");
	values.push(id, userId);

	await db
		.prepare(`UPDATE invitations SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`)
		.bind(...values)
		.run();

	return findInvitationById(db, id, userId);
}

export async function deleteInvitation(db: D1Database, id: string, userId: string): Promise<boolean> {
	const result = await db
		.prepare('DELETE FROM invitations WHERE id = ? AND user_id = ?')
		.bind(id, userId)
		.run();
	return (result.meta.changes ?? 0) > 0;
}

export async function createAsset(
	db: D1Database,
	data: { id: string; userId: string; r2Key: string; mimeType: string; sizeBytes: number },
): Promise<void> {
	await db
		.prepare(
			'INSERT INTO assets (id, user_id, r2_key, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)',
		)
		.bind(data.id, data.userId, data.r2Key, data.mimeType, data.sizeBytes)
		.run();
}

export async function deleteAssetByR2Key(
	db: D1Database,
	userId: string,
	r2Key: string,
): Promise<void> {
	await db
		.prepare('DELETE FROM assets WHERE user_id = ? AND r2_key = ?')
		.bind(userId, r2Key)
		.run();
}

export async function slugExists(db: D1Database, slug: string): Promise<boolean> {
	const row = await db
		.prepare('SELECT 1 FROM invitations WHERE public_slug = ?')
		.bind(slug)
		.first();
	return row !== null;
}
