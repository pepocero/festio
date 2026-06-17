export interface StockBackground {
	id: string;
	label: string;
	url: string;
}

/** Fondos genéricos servidos como estáticos (`/backgrounds/*`, `/templates/*`). No usan R2. */
export const STOCK_BACKGROUNDS: StockBackground[] = [
	{ id: 'abstract-warm', label: 'Cálido', url: '/backgrounds/abstract-warm.svg' },
	{ id: 'abstract-cool', label: 'Fresco', url: '/backgrounds/abstract-cool.svg' },
	{ id: 'abstract-dots', label: 'Puntos', url: '/backgrounds/abstract-dots.svg' },
	{ id: 'abstract-waves', label: 'Ondas', url: '/backgrounds/abstract-waves.svg' },
	{ id: 'abstract-night', label: 'Noche', url: '/backgrounds/abstract-night.svg' },
	{ id: 'abstract-minimal', label: 'Minimal', url: '/backgrounds/abstract-minimal.svg' },
	{ id: 'cumpleanos-rosa', label: 'Rosa festivo', url: '/templates/cumpleanos-rosa.svg' },
	{ id: 'cumpleanos-confetti', label: 'Confetti', url: '/templates/cumpleanos-confetti.svg' },
	{ id: 'boda-elegante', label: 'Boda dorada', url: '/templates/boda-elegante.svg' },
	{ id: 'boda-floral', label: 'Floral', url: '/templates/boda-floral.svg' },
	{ id: 'cena-noche', label: 'Cena noche', url: '/templates/cena-noche.svg' },
	{ id: 'cena-rustica', label: 'Cena rústica', url: '/templates/cena-rustica.svg' },
	{ id: 'evento-moderno', label: 'Evento moderno', url: '/templates/evento-moderno.svg' },
	{ id: 'evento-clasico', label: 'Evento clásico', url: '/templates/evento-clasico.svg' },
];
