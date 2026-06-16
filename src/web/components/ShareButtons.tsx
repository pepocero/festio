interface ShareButtonsProps {
	url: string;
	title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
	const shareText = encodeURIComponent(`¡Estás invitado/a! ${title} — ${url}`);
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

	return (
		<div className="share-buttons">
			<a className="btn btn-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
				WhatsApp
			</a>
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
	);
}
