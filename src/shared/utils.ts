import type { TemplateConfig } from './types';

const GOOGLE_FONTS = new Set([
	'Playfair Display',
	'Montserrat',
	'Dancing Script',
	'Lora',
]);

export function buildGoogleCalendarUrl(params: {
	title: string;
	startIso: string;
	endIso: string;
	timezone: string;
	location: string;
	details: string;
}): string {
	return buildIcsDataUrl(params);
}

/** ICS evita el formulario de Google con invitados/lista de invitados preactivados */
export function buildIcsDataUrl(params: {
	title: string;
	startIso: string;
	endIso: string;
	timezone: string;
	location: string;
	details: string;
}): string {
	const ics = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Invitaciones//ES',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${crypto.randomUUID()}@invitaciones`,
		`DTSTAMP:${toIcsDate(new Date().toISOString())}`,
		`DTSTART:${toIcsDate(params.startIso)}`,
		`DTEND:${toIcsDate(params.endIso)}`,
		`SUMMARY:${escapeIcs(params.title)}`,
		`DESCRIPTION:${escapeIcs(params.details)}`,
		params.location ? `LOCATION:${escapeIcs(params.location)}` : '',
		'STATUS:CONFIRMED',
		'TRANSP:OPAQUE',
		'CLASS:PUBLIC',
		'END:VEVENT',
		'END:VCALENDAR',
	]
		.filter(Boolean)
		.join('\r\n');

	return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function escapeIcs(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');
}

function toIcsDate(iso: string): string {
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
		backgroundImage: override.backgroundImage ?? base.backgroundImage,
		customBackgroundKey: override.customBackgroundKey ?? base.customBackgroundKey,
		backgroundPositionX: override.backgroundPositionX ?? base.backgroundPositionX,
		backgroundPositionY: override.backgroundPositionY ?? base.backgroundPositionY,
		hostFontSize: override.hostFontSize ?? base.hostFontSize,
	};
}

export function googleFontsLink(config: TemplateConfig): string {
	const families = [config.fonts.title, config.fonts.body]
		.filter((f, i, arr) => arr.indexOf(f) === i && GOOGLE_FONTS.has(f))
		.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`)
		.join('&');
	return families ? `https://fonts.googleapis.com/css2?${families}&display=swap` : '';
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

export function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
