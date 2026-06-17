export type TemplateCategory = 'cumpleanos' | 'boda' | 'cena' | 'generico';
export type InvitationStatus = 'draft' | 'published';
export type TemplateLayout = 'classic' | 'modern' | 'elegant';

export interface TemplateColors {
	primary: string;
	secondary: string;
	background: string;
	text: string;
}

export interface TemplateFonts {
	title: string;
	body: string;
}

export interface TemplateConfig {
	layout: TemplateLayout;
	colors: TemplateColors;
	fonts: TemplateFonts;
	backgroundImage?: string;
	customBackgroundKey?: string;
	/** Posición horizontal de la imagen de fondo (0–100 %) */
	backgroundPositionX?: number;
	/** Posición vertical de la imagen de fondo (0–100 %) */
	backgroundPositionY?: number;
	hostFontSize?: number;
	/** Degradado en cabecera (sin imagen) o en el filtro sobre imagen */
	heroGradient?: boolean;
	/** Filtro de color sobre la imagen de fondo */
	heroOverlay?: boolean;
}

export interface User {
	id: string;
	email: string;
	password_hash: string;
	created_at: string;
}

export interface Template {
	id: string;
	slug: string;
	name: string;
	category: TemplateCategory;
	default_config: string;
	preview_image_key: string | null;
	created_at: string;
}

export interface Invitation {
	id: string;
	user_id: string;
	public_slug: string | null;
	template_id: string;
	title: string;
	host_name: string;
	event_date: string | null;
	event_end_date: string | null;
	timezone: string;
	location: string;
	message: string;
	config: string;
	status: InvitationStatus;
	created_at: string;
	updated_at: string;
}

export interface Asset {
	id: string;
	user_id: string;
	r2_key: string;
	mime_type: string;
	size_bytes: number;
	created_at: string;
}

export interface InvitationWithTemplate extends Invitation {
	template_name?: string;
	template_category?: string;
}

export interface PublicInvitation extends Invitation {
	template_config: TemplateConfig;
}
