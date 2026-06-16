-- Usuarios
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Plantillas prediseñadas (globales, no multitenant)
CREATE TABLE IF NOT EXISTS templates (
	id TEXT PRIMARY KEY,
	slug TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	category TEXT NOT NULL,
	default_config TEXT NOT NULL,
	preview_image_key TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Invitaciones (multitenant por user_id)
CREATE TABLE IF NOT EXISTS invitations (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	public_slug TEXT UNIQUE,
	template_id TEXT NOT NULL,
	title TEXT NOT NULL DEFAULT '',
	host_name TEXT NOT NULL DEFAULT '',
	event_date TEXT,
	event_end_date TEXT,
	timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
	location TEXT NOT NULL DEFAULT '',
	message TEXT NOT NULL DEFAULT '',
	config TEXT NOT NULL DEFAULT '{}',
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_public_slug ON invitations(public_slug);

-- Assets subidos por usuarios (multitenant)
CREATE TABLE IF NOT EXISTS assets (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	r2_key TEXT NOT NULL,
	mime_type TEXT NOT NULL,
	size_bytes INTEGER NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
