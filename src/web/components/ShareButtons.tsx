import { useRef, useState, type RefObject } from 'react';
import type { TemplateConfig } from '../lib/api';
import { captureInvitationAsPng, shareInvitationPng } from '../lib/invitationImage';
import { InvitationPreview } from './InvitationPreview';

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
	const [sharingImage, setSharingImage] = useState(false);

	const shareText = encodeURIComponent(`¡Estás invitado/a! ${title}\n${url}`);
	const whatsappUrl = `https://wa.me/?text=${shareText}`;
	const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${shareText}`;

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			alert('Enlace copiado al portapapeles');
		} catch {
			prompt('Copia este enlace:', url);
		}
	};

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

	return (
		<>
			<div className="share-buttons">
				<a className="btn btn-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
					WhatsApp enlace
				</a>
				{canShareImage && (
					<button
						type="button"
						className="btn btn-whatsapp-image"
						disabled={sharingImage}
						onClick={() => void shareAsImage()}
					>
						{sharingImage ? 'Generando…' : 'WhatsApp imagen'}
					</button>
				)}
				<button type="button" className="btn btn-secondary" onClick={() => void copyLink()}>
					Copiar enlace
				</button>
				<a className="btn btn-secondary" href={emailUrl}>
					Email
				</a>
				{typeof navigator !== 'undefined' && 'share' in navigator && (
					<button type="button" className="btn btn-primary" onClick={() => void nativeShare()}>
						Compartir
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
