import type { CSSProperties } from 'react';
import type { TemplateConfig } from './api';
import { hexToRgba } from './datetime';

export function getInvitationBackgroundUrl(
	config: TemplateConfig,
	previewImageUrl?: string | null,
): string {
	if (previewImageUrl) return previewImageUrl;
	if (config.customBackgroundKey) return `/media/${config.customBackgroundKey}`;
	return config.backgroundImage ?? '';
}

export function getHeroBackgroundStyle(
	config: TemplateConfig,
	previewImageUrl?: string | null,
): CSSProperties {
	const bgUrl = getInvitationBackgroundUrl(config, previewImageUrl);
	const { primary, secondary } = config.colors;
	const posX = config.backgroundPositionX ?? 50;
	const posY = config.backgroundPositionY ?? 50;

	if (bgUrl) {
		return {
			backgroundImage: `linear-gradient(${hexToRgba(primary, 0.55)}, ${hexToRgba(secondary, 0.55)}), url("${bgUrl}")`,
			backgroundSize: 'cover',
			backgroundPosition: `${posX}% ${posY}%`,
			backgroundRepeat: 'no-repeat',
		};
	}

	return {
		background: `linear-gradient(135deg, ${primary}, ${secondary})`,
	};
}
