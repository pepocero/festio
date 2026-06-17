import { toPng } from 'html-to-image';

function slugifyFilename(title: string): string {
	const base = title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return base ? `invitacion-${base}` : 'invitacion';
}

function extractBackgroundUrls(element: HTMLElement): string[] {
	const urls = new Set<string>();
	for (const el of element.querySelectorAll('*')) {
		const bg = getComputedStyle(el).backgroundImage;
		for (const match of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
			if (match[1]) urls.add(match[1]);
		}
	}
	return [...urls];
}

async function preloadImages(urls: string[]): Promise<void> {
	await Promise.all(
		urls.map(
			(url) =>
				new Promise<void>((resolve) => {
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = () => resolve();
					img.onerror = () => resolve();
					img.src = url;
				}),
		),
	);
}

export async function captureInvitationAsPng(element: HTMLElement): Promise<Blob> {
	await document.fonts.ready;
	await preloadImages(extractBackgroundUrls(element));

	const dataUrl = await toPng(element, {
		pixelRatio: 2,
		cacheBust: true,
	});

	const response = await fetch(dataUrl);
	return response.blob();
}

function downloadBlob(blob: Blob, filename: string): void {
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = objectUrl;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(objectUrl);
}

export async function shareInvitationPng(params: {
	blob: Blob;
	title: string;
	url?: string;
}): Promise<'shared' | 'downloaded'> {
	const { blob, title, url } = params;
	const filename = `${slugifyFilename(title)}.png`;
	const file = new File([blob], filename, { type: 'image/png' });
	const shareText = url
		? `¡Estás invitado/a! ${title}\n${url}`
		: `¡Estás invitado/a! ${title}`;

	if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
		await navigator.share({
			title,
			text: shareText,
			files: [file],
		});
		return 'shared';
	}

	downloadBlob(blob, filename);
	return 'downloaded';
}
