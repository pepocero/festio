import type { TemplateConfig } from './types';

export const AVAILABLE_FONTS = [
	{ name: 'Playfair Display', weights: '400;600;700' },
	{ name: 'Montserrat', weights: '400;600;700' },
	{ name: 'Dancing Script', weights: '400;600;700' },
	{ name: 'Lora', weights: '400;600' },
	{ name: 'Bangers', weights: null },
	{ name: 'Rubik Distressed', weights: null },
	{ name: 'Great Vibes', weights: null },
] as const;

export const FONT_OPTIONS = AVAILABLE_FONTS.map((font) => font.name);

export const FONT_DISPLAY_NAMES: Record<string, string> = {
	Bangers: 'Bangers (cómic)',
	'Rubik Distressed': 'Rubik Distressed (desgastada)',
	'Great Vibes': 'Great Vibes (cursiva)',
};

const GOOGLE_FONTS = new Set<string>(FONT_OPTIONS);

export const DEFAULT_TITLE_POSITION = { x: 50, y: 88 };

export function buildGoogleCalendarUrl(params: {
	title: string;
	startIso: string;
	endIso: string;
	timezone: string;
	location: string;
	details: string;
}): string {
	const start = toGoogleCalendarDate(params.startIso);
	const end = toGoogleCalendarDate(params.endIso);
	const qs = new URLSearchParams({
		action: 'TEMPLATE',
		text: params.title,
		dates: `${start}/${end}`,
		details: params.details,
		location: params.location,
		ctz: params.timezone,
	});
	return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

function toGoogleCalendarDate(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		`${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
		`T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
	);
}

export function defaultEndDate(startIso: string): string {
	const d = new Date(startIso);
	d.setUTCHours(d.getUTCHours() + 2);
	return d.toISOString();
}

export function parseTemplateConfig(json: string): TemplateConfig {
	return JSON.parse(json) as TemplateConfig;
}

export function mergeConfig(base: TemplateConfig, override?: Partial<TemplateConfig>): TemplateConfig {
	if (!override) return base;
	return {
		layout: override.layout ?? base.layout,
		colors: { ...base.colors, ...override.colors },
		fonts: { ...base.fonts, ...override.fonts },
		backgroundImage:
			'backgroundImage' in override ? override.backgroundImage || undefined : base.backgroundImage,
		customBackgroundKey:
			'customBackgroundKey' in override
				? override.customBackgroundKey || undefined
				: base.customBackgroundKey,
		backgroundPositionX: override.backgroundPositionX ?? base.backgroundPositionX,
		backgroundPositionY: override.backgroundPositionY ?? base.backgroundPositionY,
		hostFontSize: override.hostFontSize ?? base.hostFontSize,
		heroGradient: override.heroGradient ?? base.heroGradient,
		heroOverlay: override.heroOverlay ?? base.heroOverlay,
		titlePositionX: override.titlePositionX ?? base.titlePositionX,
		titlePositionY: override.titlePositionY ?? base.titlePositionY,
	};
}

export const HERO_OVERLAY_OPACITY = 0.55;

export function resolveHeroGradientEnabled(config: TemplateConfig): boolean {
	return config.heroGradient ?? false;
}

export function resolveHeroOverlayEnabled(config: TemplateConfig): boolean {
	return config.heroOverlay ?? false;
}

export function getHeroFillBackground(config: TemplateConfig): string {
	const { primary, secondary } = config.colors;
	if (resolveHeroGradientEnabled(config)) {
		return `linear-gradient(135deg, ${primary}, ${secondary})`;
	}
	return primary;
}

export function getHeroImageOverlay(config: TemplateConfig): string | null {
	if (!resolveHeroOverlayEnabled(config)) {
		return null;
	}

	const { primary, secondary } = config.colors;
	if (resolveHeroGradientEnabled(config)) {
		return `linear-gradient(${hexToRgba(primary, HERO_OVERLAY_OPACITY)}, ${hexToRgba(secondary, HERO_OVERLAY_OPACITY)})`;
	}

	const tint = hexToRgba(primary, HERO_OVERLAY_OPACITY);
	return `linear-gradient(${tint}, ${tint})`;
}

export function resolveElegantBorderColor(config: TemplateConfig): string {
	const { primary, secondary } = config.colors;
	return resolveHeroGradientEnabled(config) ? secondary : primary;
}

export function buildCardHeroBackgroundCss(
	config: TemplateConfig,
	bgUrl: string,
	bgPos: { x: number; y: number },
): string {
	const positionCss = `background-position: ${bgPos.x}% ${bgPos.y}%; background-size: cover; background-repeat: no-repeat;`;

	if (!bgUrl) {
		return `background: ${getHeroFillBackground(config)};`;
	}

	const overlay = getHeroImageOverlay(config);
	if (overlay) {
		return `background-image: ${overlay}, url('${bgUrl}'); ${positionCss}`;
	}

	return `background-image: url('${bgUrl}'); ${positionCss}`;
}

export function googleFontsLink(config: TemplateConfig): string {
	const families = [config.fonts.title, config.fonts.body]
		.filter((f, i, arr) => arr.indexOf(f) === i && GOOGLE_FONTS.has(f))
		.map((f) => {
			const meta = AVAILABLE_FONTS.find((font) => font.name === f);
			const encoded = encodeURIComponent(f);
			if (!meta?.weights) return `family=${encoded}`;
			return `family=${encoded}:wght@${meta.weights}`;
		})
		.join('&');
	return families ? `https://fonts.googleapis.com/css2?${families}&display=swap` : '';
}

export function resolveOgImage(params: {
	appUrl: string;
	customBackgroundKey?: string | null;
	backgroundImage?: string | null;
}): { url: string; type: string } {
	if (params.customBackgroundKey) {
		const ext = params.customBackgroundKey.split('.').pop()?.toLowerCase();
		const type =
			ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
		return { url: `${params.appUrl}/media/${params.customBackgroundKey}`, type };
	}

	const bg = params.backgroundImage ?? '';
	if (/\.(jpe?g|png|webp)(\?|$)/i.test(bg)) {
		const url = bg.startsWith('/') ? `${params.appUrl}${bg}` : bg;
		const type = /\.png/i.test(bg) ? 'image/png' : /\.webp/i.test(bg) ? 'image/webp' : 'image/jpeg';
		return { url, type };
	}

	return { url: `${params.appUrl}/og-default.png`, type: 'image/png' };
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function formatEventDate(iso: string | null, timezone: string): string {
	if (!iso) return 'Fecha por confirmar';
	try {
		return new Intl.DateTimeFormat('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: timezone,
		}).format(new Date(iso));
	} catch {
		return new Date(iso).toLocaleString('es-ES');
	}
}

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const AUTH_COOKIE = 'auth_token';
export const JWT_EXPIRY = '7d';
export const DEFAULT_HOST_FONT_SIZE = 15;

export function resolveHostFontSize(config: TemplateConfig): number {
	return config.hostFontSize ?? DEFAULT_HOST_FONT_SIZE;
}

export function resolveBackgroundPosition(config: TemplateConfig): { x: number; y: number } {
	return {
		x: config.backgroundPositionX ?? 50,
		y: config.backgroundPositionY ?? 50,
	};
}

export function resolveTitlePosition(config: TemplateConfig): { x: number; y: number } {
	return {
		x: config.titlePositionX ?? DEFAULT_TITLE_POSITION.x,
		y: config.titlePositionY ?? DEFAULT_TITLE_POSITION.y,
	};
}

export function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
