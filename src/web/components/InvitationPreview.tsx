import { forwardRef, useRef, useState, type PointerEvent } from 'react';
import type { TemplateConfig } from '../lib/api';
import { getHeroBackgroundStyle, getInvitationBackgroundUrl } from '../lib/invitationStyle';

const DEFAULT_HOST_FONT_SIZE = 15;

interface PreviewProps {
	title: string;
	hostName: string;
	eventDate: string | null;
	location: string;
	message: string;
	config: TemplateConfig;
	timezone: string;
	previewImageUrl?: string | null;
	/** Permite arrastrar la imagen de fondo en el editor */
	editableBackground?: boolean;
	onBackgroundPositionChange?: (x: number, y: number) => void;
	/** Oculta controles del editor al exportar como imagen */
	exportMode?: boolean;
}

const COLOR_LABELS: Record<keyof TemplateConfig['colors'], string> = {
	primary: 'Primario',
	secondary: 'Secundario',
	background: 'Fondo',
	text: 'Texto',
};

export const InvitationPreview = forwardRef<HTMLDivElement, PreviewProps>(function InvitationPreview(
	{
	title,
	hostName,
	eventDate,
	location,
	message,
	config,
	timezone,
	previewImageUrl,
	editableBackground = false,
	onBackgroundPositionChange,
	exportMode = false,
	},
	ref,
) {
	const heroRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState(false);

	const bgUrl = getInvitationBackgroundUrl(config, previewImageUrl);

	const { primary, secondary, background, text } = config.colors;
	const hostFontSize = config.hostFontSize ?? DEFAULT_HOST_FONT_SIZE;
	const canDrag = !exportMode && editableBackground && !!bgUrl && !!onBackgroundPositionChange;

	const formattedDate = eventDate
		? new Intl.DateTimeFormat('es-ES', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				timeZone: timezone,
			}).format(new Date(eventDate))
		: 'Fecha por confirmar';

	const heroStyle = getHeroBackgroundStyle(config, previewImageUrl);

	const updatePositionFromEvent = (clientX: number, clientY: number) => {
		const el = heroRef.current;
		if (!el || !onBackgroundPositionChange) return;
		const rect = el.getBoundingClientRect();
		const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
		const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)));
		onBackgroundPositionChange(x, y);
	};

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (!canDrag) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		setDragging(true);
		updatePositionFromEvent(e.clientX, e.clientY);
	};

	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!dragging || !canDrag) return;
		updatePositionFromEvent(e.clientX, e.clientY);
	};

	const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (!canDrag) return;
		e.currentTarget.releasePointerCapture(e.pointerId);
		setDragging(false);
	};

	return (
		<div
			ref={ref}
			className={`preview-card layout-${config.layout}`}
			style={{
				borderColor: config.layout === 'elegant' ? secondary : undefined,
			}}
		>
			<div
				ref={heroRef}
				className={`preview-hero${canDrag ? ' preview-hero--draggable' : ''}${dragging ? ' is-dragging' : ''}`}
				style={heroStyle}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
			>
				{canDrag && (
					<span className="preview-hero-hint" aria-hidden>
						↔ Arrastra para mover la imagen
					</span>
				)}
				<h2 style={{ fontFamily: `'${config.fonts.title}', serif` }}>{title || 'Mi invitación'}</h2>
			</div>
			<div
				className="preview-body"
				style={{
					backgroundColor: background,
					color: text,
					fontFamily: `'${config.fonts.body}', serif`,
				}}
			>
				{hostName && (
					<p className="preview-host" style={{ color: primary, fontSize: `${hostFontSize}px` }}>
						<span className="preview-host-label">Organiza:</span> {hostName}
					</p>
				)}
				<p
					className="preview-date"
					style={{
						backgroundColor: background,
						borderLeftColor: primary,
						color: text,
					}}
				>
					📅 {formattedDate}
				</p>
				{location && <p className="preview-location">📍 {location}</p>}
				{message && <p className="preview-message">{message}</p>}
			</div>
		</div>
	);
});

export { COLOR_LABELS };
