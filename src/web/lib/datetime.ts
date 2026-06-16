function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function splitIsoToDateAndTime(iso: string | null): { date: string; time: string } {
	if (!iso) return { date: '', time: '' };
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return {
		date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
		time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
	};
}

export function combineDateAndTime(date: string, time: string): string | null {
	if (!date) return null;
	const t = time || '00:00';
	const combined = new Date(`${date}T${t}`);
	if (Number.isNaN(combined.getTime())) return null;
	return combined.toISOString();
}

export { hexToRgba };
