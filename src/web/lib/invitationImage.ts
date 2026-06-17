import { toBlob } from 'html-to-image';

const MIN_BLOB_SIZE = 8_000;
const MAX_CAPTURE_ATTEMPTS = 5;

function slugifyFilename(title: string): string {
	const base = title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return base ? `invitacion-${base}` : 'invitacion';
}

function extractImageUrls(element: HTMLElement): string[] {
	const urls = new Set<string>();
	const nodes = [element, ...element.querySelectorAll<HTMLElement>('*')];

	for (const el of nodes) {
		if (el instanceof HTMLImageElement && el.src) {
			urls.add(el.src);
		}

		const bg = getComputedStyle(el).backgroundImage;
		for (const match of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
			if (match[1]) urls.add(match[1]);
		}
	}

	return [...urls];
}

async function waitForPaint(): Promise<void> {
	await document.fonts.ready;
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => resolve());
		});
	});
}

async function preloadImages(urls: string[]): Promise<void> {
	await Promise.all(
		urls.map(async (url) => {
			if (url.startsWith('data:')) return;

			const img = new Image();
			if (!url.startsWith('blob:')) {
				img.crossOrigin = 'anonymous';
			}
			img.src = url;

			try {
				await img.decode();
			} catch {
				await new Promise<void>((resolve) => {
					img.onload = () => resolve();
					img.onerror = () => resolve();
				});
			}
		}),
	);
}

function getCapturePixelRatio(): number {
	return Math.min(window.devicePixelRatio || 1, 2);
}

function prepareElementForCapture(element: HTMLElement): () => void {
	const restores: Array<() => void> = [];

	const prevBoxShadow = element.style.boxShadow;
	element.style.boxShadow = 'none';
	restores.push(() => {
		element.style.boxShadow = prevBoxShadow;
	});

	const exportRoot = element.closest('.invitation-image-export-root') as HTMLElement | null;
	if (exportRoot) {
		const prev = {
			opacity: exportRoot.style.opacity,
			visibility: exportRoot.style.visibility,
			zIndex: exportRoot.style.zIndex,
			left: exportRoot.style.left,
			top: exportRoot.style.top,
		};
		exportRoot.style.opacity = '1';
		exportRoot.style.visibility = 'visible';
		exportRoot.style.zIndex = '-1';
		exportRoot.style.left = '0';
		exportRoot.style.top = '0';
		restores.push(() => {
			exportRoot.style.opacity = prev.opacity;
			exportRoot.style.visibility = prev.visibility;
			exportRoot.style.zIndex = prev.zIndex;
			exportRoot.style.left = prev.left;
			exportRoot.style.top = prev.top;
		});
	}

	element.scrollIntoView({ block: 'center', inline: 'nearest' });

	return () => {
		for (let i = restores.length - 1; i >= 0; i -= 1) {
			restores[i]();
		}
	};
}

export async function captureInvitationAsPng(element: HTMLElement): Promise<Blob> {
	const restore = prepareElementForCapture(element);

	try {
		await waitForPaint();
		await preloadImages(extractImageUrls(element));
		await waitForPaint();

		const pixelRatio = getCapturePixelRatio();
		let blob: Blob | null = null;
		let lastSize = 0;

		for (let attempt = 0; attempt < MAX_CAPTURE_ATTEMPTS; attempt += 1) {
			blob = await toBlob(element, {
				pixelRatio,
				cacheBust: true,
				backgroundColor: '#ffffff',
				onClone: (_doc, cloned) => {
					cloned.style.boxShadow = 'none';
					for (const node of cloned.querySelectorAll<HTMLElement>('.preview-card, .preview-hero')) {
						node.style.boxShadow = 'none';
					}
				},
			});

			if (!blob) continue;

			if (blob.size > MIN_BLOB_SIZE && (attempt === 0 || blob.size >= lastSize)) {
				if (attempt >= 1 || blob.size > MIN_BLOB_SIZE * 2) {
					break;
				}
			}

			lastSize = blob.size;
			await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
			await waitForPaint();
		}

		if (!blob || blob.size < MIN_BLOB_SIZE) {
			throw new Error('No se pudo generar la imagen correctamente');
		}

		return blob;
	} finally {
		restore();
	}
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
