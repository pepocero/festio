import { forwardRef, memo, useRef, useState, type PointerEvent } from 'react';
import type { TemplateConfig } from '../lib/api';
import { getInvitationBackgroundUrl, getHeroOverlayStyle } from '../lib/invitationStyle';
import {
	getHeroFillBackground,
	resolveElegantBorderColor,
	resolveTitlePosition,
} from '@shared/utils';

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
	/** Permite arrastrar el título en la cabecera */
	editableTitlePosition?: boolean;
	onTitlePositionChange?: (x: number, y: number) => void;
	/** Oculta controles del editor al exportar como imagen */
	exportMode?: boolean;
}

const COLOR_LABELS: Record<keyof TemplateConfig['colors'], string> = {
	primary: 'Color cabecera',
	secondary: 'Color degradado',
	background: 'Fondo',
	text: 'Texto',
};

type DragOrigin = {
	clientX: number;
	clientY: number;
	posX: number;
	posY: number;
};

export const InvitationPreview = memo(forwardRef<HTMLDivElement, PreviewProps>(function InvitationPreview(
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
	editableTitlePosition = false,
	onTitlePositionChange,
	exportMode = false,
	},
	ref,
) {
	const heroRef = useRef<HTMLDivElement>(null);
	const bgDragOriginRef = useRef<DragOrigin | null>(null);
	const titleDragOriginRef = useRef<DragOrigin | null>(null);
	const [draggingBackground, setDraggingBackground] = useState(false);
	const [draggingTitle, setDraggingTitle] = useState(false);

	const bgUrl = getInvitationBackgroundUrl(config, previewImageUrl);

	const { primary, background, text } = config.colors;
	const hostFontSize = config.hostFontSize ?? DEFAULT_HOST_FONT_SIZE;
	const bgPos = { x: config.backgroundPositionX ?? 50, y: config.backgroundPositionY ?? 50 };
	const titlePos = resolveTitlePosition(config);
	const fallbackBackground = getHeroFillBackground(config);
	const overlayStyle = getHeroOverlayStyle(config);
	const elegantBorder = resolveElegantBorderColor(config);
	const imgCrossOrigin = bgUrl && !bgUrl.startsWith('blob:') ? ('anonymous' as const) : undefined;
	const canDragBackground =
		!exportMode && editableBackground && !!bgUrl && !!onBackgroundPositionChange;
	const canDragTitle = !exportMode && editableTitlePosition && !!onTitlePositionChange;

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

	const updateBackgroundFromDelta = (clientX: number, clientY: number) => {
		const origin = bgDragOriginRef.current;
		const el = heroRef.current;
		if (!origin || !el || !onBackgroundPositionChange) return;
		const rect = el.getBoundingClientRect();
		const deltaX = ((clientX - origin.clientX) / rect.width) * 100;
		const deltaY = -((clientY - origin.clientY) / rect.height) * 100;
		const x = Math.round(Math.min(100, Math.max(0, origin.posX + deltaX)));
		const y = Math.round(Math.min(100, Math.max(0, origin.posY + deltaY)));
		onBackgroundPositionChange(x, y);
	};

	const updateTitleFromDelta = (clientX: number, clientY: number) => {
		const origin = titleDragOriginRef.current;
		const el = heroRef.current;
		if (!origin || !el || !onTitlePositionChange) return;
		const rect = el.getBoundingClientRect();
		const deltaX = ((clientX - origin.clientX) / rect.width) * 100;
		const deltaY = ((clientY - origin.clientY) / rect.height) * 100;
		const x = Math.round(Math.min(100, Math.max(0, origin.posX + deltaX)));
		const y = Math.round(Math.min(100, Math.max(0, origin.posY + deltaY)));
		onTitlePositionChange(x, y);
	};

	const onHeroPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (!canDragBackground || (e.target as HTMLElement).closest('.preview-hero-title')) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		setDraggingBackground(true);
		bgDragOriginRef.current = {
			clientX: e.clientX,
			clientY: e.clientY,
			posX: bgPos.x,
			posY: bgPos.y,
		};
	};

	const onHeroPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!draggingBackground || !canDragBackground) return;
		updateBackgroundFromDelta(e.clientX, e.clientY);
	};

	const onHeroPointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (!canDragBackground) return;
		if (draggingBackground) {
			e.currentTarget.releasePointerCapture(e.pointerId);
			bgDragOriginRef.current = null;
			setDraggingBackground(false);
		}
	};

	const onTitlePointerDown = (e: PointerEvent<HTMLHeadingElement>) => {
		if (!canDragTitle) return;
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		setDraggingTitle(true);
		titleDragOriginRef.current = {
			clientX: e.clientX,
			clientY: e.clientY,
			posX: titlePos.x,
			posY: titlePos.y,
		};
	};

	const onTitlePointerMove = (e: PointerEvent<HTMLHeadingElement>) => {
		if (!draggingTitle || !canDragTitle) return;
		e.stopPropagation();
		updateTitleFromDelta(e.clientX, e.clientY);
	};

	const onTitlePointerUp = (e: PointerEvent<HTMLHeadingElement>) => {
		if (!canDragTitle || !draggingTitle) return;
		e.stopPropagation();
		e.currentTarget.releasePointerCapture(e.pointerId);
		titleDragOriginRef.current = null;
		setDraggingTitle(false);
	};

	return (
		<div
			ref={ref}
			className={`preview-card layout-${config.layout}`}
			style={{
				borderColor: config.layout === 'elegant' ? elegantBorder : undefined,
			}}
		>
			<div
				ref={heroRef}
				className={`preview-hero${canDragBackground ? ' preview-hero--draggable' : ''}${draggingBackground ? ' is-dragging' : ''}`}
				style={!bgUrl ? { background: fallbackBackground } : undefined}
				onPointerDown={onHeroPointerDown}
				onPointerMove={onHeroPointerMove}
				onPointerUp={onHeroPointerUp}
				onPointerCancel={onHeroPointerUp}
			>
				{bgUrl && (
					<>
						<img
							src={bgUrl}
							alt=""
							className="preview-hero-bg"
							crossOrigin={imgCrossOrigin}
							draggable={false}
							style={{ objectPosition: `${bgPos.x}% ${bgPos.y}%` }}
						/>
						{overlayStyle && (
							<div
								className="preview-hero-overlay"
								style={overlayStyle}
								aria-hidden
							/>
						)}
					</>
				)}
				{canDragBackground && (
					<span className="preview-hero-hint" aria-hidden>
						↔ Arrastra el fondo para moverlo
					</span>
				)}
				{canDragTitle && (
					<span className="preview-hero-hint preview-hero-hint--title" aria-hidden>
						↕ Arrastra el título para ubicarlo
					</span>
				)}
				<h2
					className={`preview-hero-title${canDragTitle ? ' preview-hero-title--draggable' : ''}${draggingTitle ? ' is-dragging' : ''}`}
					style={{
						fontFamily: `'${config.fonts.title}', serif`,
						left: `${titlePos.x}%`,
						top: `${titlePos.y}%`,
					}}
					onPointerDown={onTitlePointerDown}
					onPointerMove={onTitlePointerMove}
					onPointerUp={onTitlePointerUp}
					onPointerCancel={onTitlePointerUp}
				>
					{title || 'Mi invitación'}
				</h2>
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
}));

export { COLOR_LABELS };
