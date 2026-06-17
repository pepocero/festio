import type { CSSProperties } from 'react';
import type { TemplateConfig } from './api';
import {
	buildCardHeroBackgroundCss,
	getHeroFillBackground,
	getHeroImageOverlay,
	resolveBackgroundPosition,
} from '@shared/utils';

export function getInvitationBackgroundUrl(
	config: TemplateConfig,
	previewImageUrl?: string | null,
): string {
	if (previewImageUrl) return previewImageUrl;
	if (config.customBackgroundKey) return `/media/${config.customBackgroundKey}`;
	if (config.backgroundImage) return config.backgroundImage;
	return '';
}

export function getHeroBackgroundStyle(
	config: TemplateConfig,
	previewImageUrl?: string | null,
): CSSProperties {
	const bgUrl = getInvitationBackgroundUrl(config, previewImageUrl);
	const bgPos = resolveBackgroundPosition(config);

	if (!bgUrl) {
		return { background: getHeroFillBackground(config) };
	}

	const css = buildCardHeroBackgroundCss(config, bgUrl, bgPos);
	const backgroundImage = css.match(/background-image:\s*([^;]+);/)?.[1];
	const background = css.match(/^background:\s*([^;]+);/)?.[1];

	if (backgroundImage) {
		return {
			backgroundImage,
			backgroundSize: 'cover',
			backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
			backgroundRepeat: 'no-repeat',
		};
	}

	return { background: background ?? getHeroFillBackground(config) };
}

export function getHeroOverlayStyle(config: TemplateConfig): CSSProperties | null {
	const overlay = getHeroImageOverlay(config);
	return overlay ? { background: overlay } : null;
}
