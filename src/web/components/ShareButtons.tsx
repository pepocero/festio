import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { TemplateConfig } from '../lib/api';
import { captureInvitationAsPng, shareInvitationPng } from '../lib/invitationImage';
import { InvitationPreview } from './InvitationPreview';
import { EmailIcon, ShareIcon, WhatsAppIcon } from './icons';

export interface InvitationShareImageData {
	title: string;
	hostName: string;
	eventDate: string | null;
	location: string;
	message: string;
	config: TemplateConfig;
	timezone: string;
}

interface ShareButtonsProps {
	url: string;
	title: string;
	invitation?: InvitationShareImageData;
	previewRef?: RefObject<HTMLDivElement | null>;
}

export function ShareButtons({ url, title, invitation, previewRef }: ShareButtonsProps) {
	const exportRef = useRef<HTMLDivElement>(null);
	const whatsappMenuRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [sharingImage, setSharingImage] = useState(false);
	const [isWhatsappMenuOpen, setIsWhatsappMenuOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

	const shareText = encodeURIComponent(`¡Estás invitado/a! ${title}\n${url}`);
	const whatsappUrl = `https://wa.me/?text=${shareText}`;
	const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${shareText}`;

	const nativeShare = async () => {
		if (navigator.share) {
			await navigator.share({ title, text: `¡Estás invitado/a! ${title}`, url });
		}
	};

	const shareAsImage = async () => {
		if (!invitation && !previewRef?.current) return;

		setSharingImage(true);
		try {
			const element =
				previewRef?.current ?? exportRef.current?.querySelector<HTMLDivElement>('.preview-card');
			if (!element) {
				throw new Error('No se pudo preparar la vista previa');
			}

			const dragHint = element.querySelector<HTMLElement>('.preview-hero-hint');
			const previousHintDisplay = dragHint?.style.display ?? '';
			if (dragHint) dragHint.style.display = 'none';

			let blob: Blob;
			try {
				blob = await captureInvitationAsPng(element);
			} finally {
				if (dragHint) dragHint.style.display = previousHintDisplay;
			}

			const result = await shareInvitationPng({ blob, title, url });

			if (result === 'downloaded') {
				alert(
					'Imagen descargada. Ábrela desde tu galería o archivos y compártela por WhatsApp como foto.',
				);
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') return;
			alert(err instanceof Error ? err.message : 'No se pudo generar la imagen');
		} finally {
			setSharingImage(false);
		}
	};

	const canShareImage = !!invitation || !!previewRef;

	useLayoutEffect(() => {
		if (!isWhatsappMenuOpen || !triggerRef.current) return;

		const updatePosition = () => {
			const rect = triggerRef.current!.getBoundingClientRect();
			const panelWidth = 180;
			const left = Math.min(Math.max(8, rect.left), window.innerWidth - panelWidth - 8);

			setDropdownStyle({
				position: 'fixed',
				top: rect.bottom + 6,
				left,
				width: panelWidth,
				zIndex: 1000,
			});
		};

		updatePosition();
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [isWhatsappMenuOpen]);

	useEffect(() => {
		if (!isWhatsappMenuOpen) return;

		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node;
			if (
				whatsappMenuRef.current?.contains(target) ||
				(target instanceof Element && target.closest('.share-menu-dropdown'))
			) {
				return;
			}
			setIsWhatsappMenuOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [isWhatsappMenuOpen]);

	return (
		<>
			<div className="share-buttons">
				<div className="share-menu" ref={whatsappMenuRef}>
					<button
						ref={triggerRef}
						type="button"
						className="btn btn-whatsapp btn-icon share-menu-trigger"
						aria-haspopup="menu"
						aria-expanded={isWhatsappMenuOpen}
						aria-label="WhatsApp"
						title="WhatsApp"
						onClick={() => setIsWhatsappMenuOpen((prev) => !prev)}
					>
						<WhatsAppIcon />
					</button>
					{isWhatsappMenuOpen &&
						createPortal(
							<div
								className="share-menu-dropdown"
								style={dropdownStyle}
								role="menu"
								aria-label="Opciones de WhatsApp"
							>
								<a
									className="share-menu-item"
									role="menuitem"
									href={whatsappUrl}
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => setIsWhatsappMenuOpen(false)}
								>
									Compartir enlace
								</a>
								{canShareImage && (
									<button
										type="button"
										className="share-menu-item"
										role="menuitem"
										disabled={sharingImage}
										onClick={() => {
											setIsWhatsappMenuOpen(false);
											void shareAsImage();
										}}
									>
										{sharingImage ? 'Generando imagen…' : 'Compartir imagen'}
									</button>
								)}
							</div>,
							document.body,
						)}
				</div>
				<a
					className="btn btn-secondary btn-icon"
					href={emailUrl}
					aria-label="Email"
					title="Email"
				>
					<EmailIcon />
				</a>
				{typeof navigator !== 'undefined' && 'share' in navigator && (
					<button
						type="button"
						className="btn btn-primary btn-icon"
						aria-label="Compartir"
						title="Compartir"
						onClick={() => void nativeShare()}
					>
						<ShareIcon />
					</button>
				)}
			</div>

			{invitation && !previewRef && (
				<div ref={exportRef} className="invitation-image-export-root" aria-hidden>
					<InvitationPreview
						title={invitation.title}
						hostName={invitation.hostName}
						eventDate={invitation.eventDate}
						location={invitation.location}
						message={invitation.message}
						config={invitation.config}
						timezone={invitation.timezone}
						exportMode
					/>
				</div>
			)}
		</>
	);
}
