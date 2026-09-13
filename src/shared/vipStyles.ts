import type { TemplateConfig } from './types';

export const VIP_STYLE_IDS = [
	'seal-gold',
	'ribbon',
	'medallion',
	'diamond',
	'floral',
	'noir',
	'crown-gold',
	'crown-royal',
	'laurel-gold',
	'laurel-classic',
	'laurel-diamond',
	'crown-flourish',
	'crown-baroque',
	'crown-badge',
	'crown-ring',
] as const;
export const VIP_CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export type VipStyleId = (typeof VIP_STYLE_IDS)[number];
export type VipCorner = (typeof VIP_CORNERS)[number];

export interface VipStyle {
	id: VipStyleId;
	label: string;
	url: string;
	/** Arte distinto por esquina para que el texto no se invierta */
	cornerArt: boolean;
	/** Rama + disco VIP superpuesto (el disco no se espeja) */
	overlay?: boolean;
	shape: 'seal' | 'corner';
}

export const DEFAULT_VIP_STYLE: VipStyleId = 'seal-gold';
export const DEFAULT_VIP_CORNER: VipCorner = 'top-right';
export const DEFAULT_VIP_SIZE = 22;
export const MIN_VIP_SIZE = 2;
export const MAX_VIP_SIZE = 42;

export const VIP_STYLES: VipStyle[] = [
	{ id: 'seal-gold', label: 'Sello oro', url: '/vip/seal-gold.svg', cornerArt: false, shape: 'seal' },
	{ id: 'ribbon', label: 'Cinta', url: '/vip/ribbon-top-left.svg', cornerArt: true, shape: 'corner' },
	{ id: 'medallion', label: 'Medallón', url: '/vip/medallion.svg', cornerArt: false, shape: 'seal' },
	{ id: 'diamond', label: 'Diamante', url: '/vip/diamond.svg', cornerArt: false, shape: 'seal' },
	{
		id: 'floral',
		label: 'Floral',
		url: '/vip/floral-branch.png',
		cornerArt: false,
		overlay: true,
		shape: 'corner',
	},
	{ id: 'noir', label: 'Noche', url: '/vip/noir.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-gold', label: 'Corona oro', url: '/vip/crown-gold.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-royal', label: 'Corona real', url: '/vip/crown-royal.svg', cornerArt: false, shape: 'seal' },
	{ id: 'laurel-gold', label: 'Disco oro', url: '/vip/laurel-gold.svg', cornerArt: false, shape: 'seal' },
	{ id: 'laurel-classic', label: 'Disco noche', url: '/vip/laurel-classic.svg', cornerArt: false, shape: 'seal' },
	{ id: 'laurel-diamond', label: 'Disco diamante', url: '/vip/laurel-diamond.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-flourish', label: 'Corona filigrana', url: '/vip/crown-flourish.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-baroque', label: 'Corona barroca', url: '/vip/crown-baroque.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-badge', label: 'Medalla corona', url: '/vip/crown-badge.svg', cornerArt: false, shape: 'seal' },
	{ id: 'crown-ring', label: 'Anillo corona', url: '/vip/crown-ring.svg', cornerArt: false, shape: 'seal' },
];

export interface ResolvedVipBadge {
	url: string;
	corner: VipCorner;
	shape: 'seal' | 'corner';
	size: number;
	overlay: boolean;
	discUrl?: string;
}

export const VIP_FLORAL_DISC_URL = '/vip/laurel-gold.svg';

export function vipArtFlipClass(corner: VipCorner): string {
	if (corner === 'top-right') return 'vip-badge-art--flip-x';
	if (corner === 'bottom-left') return 'vip-badge-art--flip-y';
	if (corner === 'bottom-right') return 'vip-badge-art--flip-xy';
	return '';
}

export function resolveVipSize(config: TemplateConfig): number {
	const raw = config.vipSize ?? DEFAULT_VIP_SIZE;
	return Math.min(MAX_VIP_SIZE, Math.max(MIN_VIP_SIZE, raw));
}

export function resolveVipBadge(config: TemplateConfig): ResolvedVipBadge | null {
	if (!config.vipEnabled) return null;
	const style =
		VIP_STYLES.find((item) => item.id === config.vipStyle) ??
		VIP_STYLES.find((item) => item.id === DEFAULT_VIP_STYLE) ??
		VIP_STYLES[0];
	const corner = config.vipCorner ?? DEFAULT_VIP_CORNER;
	return {
		url: style.cornerArt ? `/vip/${style.id}-${corner}.svg` : style.url,
		corner,
		shape: style.shape,
		size: resolveVipSize(config),
		overlay: Boolean(style.overlay),
		discUrl: style.overlay ? VIP_FLORAL_DISC_URL : undefined,
	};
}
