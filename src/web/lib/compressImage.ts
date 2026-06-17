const MAX_DIMENSION = 1600;
const TARGET_MAX_BYTES = 350_000;
const MIN_QUALITY = 0.45;
const INITIAL_QUALITY = 0.82;

function fitDimensions(width: number, height: number, max: number): { width: number; height: number } {
	if (width <= max && height <= max) {
		return { width, height };
	}

	const scale = max / Math.max(width, height);
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
	};
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob), type, quality);
	});
}

export async function compressImageForUpload(file: File): Promise<File> {
	const bitmap = await createImageBitmap(file);
	const { width, height } = fitDimensions(bitmap.width, bitmap.height, MAX_DIMENSION);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		bitmap.close();
		throw new Error('No se pudo procesar la imagen');
	}

	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const outputType = 'image/webp';
	let quality = INITIAL_QUALITY;
	let blob: Blob | null = null;

	for (let attempt = 0; attempt < 8; attempt += 1) {
		blob = await canvasToBlob(canvas, outputType, quality);
		if (blob && blob.size <= TARGET_MAX_BYTES) {
			break;
		}
		quality = Math.max(MIN_QUALITY, quality - 0.08);
	}

	if (!blob) {
		throw new Error('No se pudo comprimir la imagen');
	}

	const baseName = file.name.replace(/\.[^.]+$/, '') || 'fondo';
	return new File([blob], `${baseName}.webp`, { type: outputType });
}
