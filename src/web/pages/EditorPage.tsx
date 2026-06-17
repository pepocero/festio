import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Invitation, type TemplateConfig } from '../lib/api';
import { compressImageForUpload } from '../lib/compressImage';
import { splitIsoToDateAndTime } from '../lib/datetime';
import { useIsMobile } from '../lib/useIsMobile';
import { COLOR_LABELS, InvitationPreview } from '../components/InvitationPreview';
import { ColorSwatchField } from '../components/ColorSwatchField';
import { DateTimeField, dateTimeToIso } from '../components/DateTimeField';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ShareButtons } from '../components/ShareButtons';
import { BackgroundPicker } from '../components/BackgroundPicker';
import { HomeIcon } from '../components/icons';

const FONT_OPTIONS = ['Playfair Display', 'Montserrat', 'Dancing Script', 'Lora'];
const HOST_FONT_SIZES = [
	{ value: 12, label: 'Pequeño (12 px)' },
	{ value: 15, label: 'Normal (15 px)' },
	{ value: 18, label: 'Mediano (18 px)' },
	{ value: 22, label: 'Grande (22 px)' },
	{ value: 26, label: 'Muy grande (26 px)' },
];
const TIMEZONES = [
	'Europe/Madrid',
	'Europe/London',
	'America/Mexico_City',
	'America/Buenos_Aires',
	'America/New_York',
];

export function EditorPage() {
	const { id } = useParams<{ id: string }>();
	const fileRef = useRef<HTMLInputElement>(null);
	const blobUrlRef = useRef<string | null>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const isMobile = useIsMobile();

	const [invitation, setInvitation] = useState<Invitation | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const [title, setTitle] = useState('');
	const [hostName, setHostName] = useState('');
	const [startDate, setStartDate] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endDate, setEndDate] = useState('');
	const [endTime, setEndTime] = useState('');
	const [timezone, setTimezone] = useState('Europe/Madrid');
	const [location, setLocation] = useState('');
	const [message, setMessage] = useState('');
	const [config, setConfig] = useState<TemplateConfig | null>(null);
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!id) return;
		api
			.getInvitation(id)
			.then(({ invitation: inv }) => {
				setInvitation(inv);
				setTitle(inv.title);
				setHostName(inv.host_name);
				const start = splitIsoToDateAndTime(inv.event_date);
				const end = splitIsoToDateAndTime(inv.event_end_date);
				setStartDate(start.date);
				setStartTime(start.time);
				setEndDate(end.date);
				setEndTime(end.time);
				setTimezone(inv.timezone);
				setLocation(inv.location);
				setMessage(inv.message);
				setConfig({
					...inv.config,
					hostFontSize: inv.config.hostFontSize ?? 15,
				});
			})
			.catch((err) => setError(err instanceof Error ? err.message : 'Error'))
			.finally(() => setLoading(false));
	}, [id]);

	const updateConfig = (partial: Partial<TemplateConfig>) => {
		setConfig((prev) => (prev ? { ...prev, ...partial } : prev));
	};

	const updateColors = (key: keyof TemplateConfig['colors'], value: string) => {
		setConfig((prev) =>
			prev ? { ...prev, colors: { ...prev.colors, [key]: value } } : prev,
		);
	};

	const updateFonts = (key: keyof TemplateConfig['fonts'], value: string) => {
		setConfig((prev) =>
			prev ? { ...prev, fonts: { ...prev.fonts, [key]: value } } : prev,
		);
	};

	const handleSave = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!id || !config) return;
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const { invitation: updated } = await api.updateInvitation(id, {
				title,
				host_name: hostName,
				event_date: dateTimeToIso(startDate, startTime),
				event_end_date: dateTimeToIso(endDate, endTime),
				timezone,
				location,
				message,
				config,
			});
			setInvitation(updated);
			setSuccess('Guardado correctamente');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al guardar');
		} finally {
			setSaving(false);
		}
	};

	const handlePublish = async () => {
		if (!id) return;
		await handleSave();
		setPublishing(true);
		setError('');
		try {
			const { invitation: published } = await api.publishInvitation(id);
			setInvitation(published);
			setSuccess('¡Invitación publicada!');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al publicar');
		} finally {
			setPublishing(false);
		}
	};

	const handleUpload = async (file: File) => {
		if (blobUrlRef.current) {
			URL.revokeObjectURL(blobUrlRef.current);
		}

		setUploading(true);
		setError('');
		try {
			const compressed = await compressImageForUpload(file);
			const blobUrl = URL.createObjectURL(compressed);
			blobUrlRef.current = blobUrl;
			setPreviewImageUrl(blobUrl);

			const { asset } = await api.uploadImage(compressed);
			setConfig((prev) =>
				prev
					? { ...prev, customBackgroundKey: asset.r2_key, backgroundImage: '' }
					: prev,
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al subir imagen');
			setPreviewImageUrl(null);
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
				blobUrlRef.current = null;
			}
		} finally {
			setUploading(false);
		}
	};

	const selectStockBackground = (url: string) => {
		if (blobUrlRef.current) {
			URL.revokeObjectURL(blobUrlRef.current);
			blobUrlRef.current = null;
		}
		setPreviewImageUrl(null);
		updateConfig({ backgroundImage: url, customBackgroundKey: '' });
	};

	const clearBackgroundImage = () => {
		if (blobUrlRef.current) {
			URL.revokeObjectURL(blobUrlRef.current);
			blobUrlRef.current = null;
		}
		setPreviewImageUrl(null);
		updateConfig({ customBackgroundKey: '', backgroundImage: '' });
	};

	if (loading) return <div className="app-layout"><p className="loading-center">Cargando...</p></div>;
	if (!invitation || !config) return <div className="app-layout"><p>Invitación no encontrada</p></div>;

	const previewEventDate = dateTimeToIso(startDate, startTime);
	const hasBackgroundImage = !!(
		previewImageUrl ||
		config.customBackgroundKey ||
		config.backgroundImage
	);
	const hasCustomBackground = !!(previewImageUrl || config.customBackgroundKey);

	const handleBackgroundPositionChange = (x: number, y: number) => {
		updateConfig({ backgroundPositionX: x, backgroundPositionY: y });
	};

	return (
		<div className="app-layout editor-layout">
			<header className="app-header editor-header">
				<div className="editor-header-row">
					<Link to="/app" className="btn btn-ghost btn-icon" aria-label="Volver" title="Volver">
						<span aria-hidden>←</span>
					</Link>
					<Link to="/" className="btn btn-secondary btn-icon" aria-label="Página principal" title="Página principal">
						<HomeIcon />
					</Link>
					<h1>Editar invitación</h1>
				</div>
				<div className="header-actions editor-header-actions">
					<button
						type="button"
						className="btn btn-secondary"
						disabled={saving}
						onClick={() => void handleSave()}
					>
						{saving ? 'Guardando...' : 'Guardar'}
					</button>
					<button
						type="button"
						className="btn btn-primary"
						disabled={publishing}
						onClick={() => void handlePublish()}
					>
						{publishing ? 'Publicando...' : invitation.status === 'published' ? 'Republicar' : 'Publicar'}
					</button>
				</div>
			</header>

			<main className="editor-main">
				{error && <div className="error-banner">{error}</div>}
				{success && <div className="success-banner">{success}</div>}

				{invitation.public_url && (
					<div className="publish-box">
						<h3>Tu invitación está publicada</h3>
						<a
							href={invitation.public_url}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-view-invitation"
						>
							Ver invitación
						</a>
						<p className="public-url text-muted">{invitation.public_url}</p>
						<ShareButtons
							url={invitation.public_url}
							title={title}
							previewRef={previewRef}
						/>
					</div>
				)}

				<div className="editor-grid">
					<aside className="editor-preview">
						<h2 className="editor-preview-title">Vista previa</h2>
						<InvitationPreview
							ref={previewRef}
							title={title}
							hostName={hostName}
							eventDate={previewEventDate}
							location={location}
							message={message}
							config={config}
							timezone={timezone}
							previewImageUrl={previewImageUrl}
							editableBackground={hasBackgroundImage}
							onBackgroundPositionChange={handleBackgroundPositionChange}
						/>
					</aside>

					<form className="editor-form" onSubmit={(e) => void handleSave(e)}>
						<CollapsibleSection title="Detalles del evento" defaultOpen>
							<label>
								Título
								<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
							</label>
							<label>
								Anfitrión / Organizador
								<input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={200} />
							</label>
							<label>
								Tamaño del nombre del organizador
								<select
									value={config.hostFontSize ?? 15}
									onChange={(e) =>
										updateConfig({ hostFontSize: Number(e.target.value) })
									}
								>
									{HOST_FONT_SIZES.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</label>
							<DateTimeField
								label="Fecha de Inicio"
								timeLabel="Hora de inicio"
								date={startDate}
								time={startTime}
								onDateChange={setStartDate}
								onTimeChange={setStartTime}
							/>
							<DateTimeField
								label="Fecha de Fin"
								timeLabel="Hora de fin"
								date={endDate}
								time={endTime}
								onDateChange={setEndDate}
								onTimeChange={setEndTime}
								optional
							/>
							<label>
								Zona horaria
								<select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
									{TIMEZONES.map((tz) => (
										<option key={tz} value={tz}>
											{tz}
										</option>
									))}
								</select>
							</label>
							<label>
								Lugar
								<input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={500} />
							</label>
							<label className="editor-form-last">
								Mensaje
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									rows={4}
									maxLength={2000}
								/>
							</label>
						</CollapsibleSection>

						<CollapsibleSection title="Personalización" defaultOpen={!isMobile}>
							<div className="color-grid">
								<ColorSwatchField
									id="color-primary"
									label={COLOR_LABELS.primary}
									value={config.colors.primary}
									onChange={(value) => updateColors('primary', value)}
								/>
								{config.heroGradient && (
									<ColorSwatchField
										id="color-secondary"
										label={COLOR_LABELS.secondary}
										value={config.colors.secondary}
										onChange={(value) => updateColors('secondary', value)}
									/>
								)}
								<ColorSwatchField
									id="color-background"
									label={COLOR_LABELS.background}
									value={config.colors.background}
									onChange={(value) => updateColors('background', value)}
								/>
								<ColorSwatchField
									id="color-text"
									label={COLOR_LABELS.text}
									value={config.colors.text}
									onChange={(value) => updateColors('text', value)}
								/>
							</div>
							<label className="toggle-option">
								<input
									type="checkbox"
									checked={config.heroGradient ?? false}
									onChange={(e) => updateConfig({ heroGradient: e.target.checked })}
								/>
								Usar degradado en la cabecera
							</label>
							{(config.customBackgroundKey || previewImageUrl || config.backgroundImage) && (
								<label className="toggle-option">
									<input
										type="checkbox"
										checked={config.heroOverlay ?? false}
										onChange={(e) => updateConfig({ heroOverlay: e.target.checked })}
									/>
									Aplicar filtro de color sobre la imagen
								</label>
							)}
							<label>
								Fuente del título
								<select
									value={config.fonts.title}
									onChange={(e) => updateFonts('title', e.target.value)}
								>
									{FONT_OPTIONS.map((f) => (
										<option key={f} value={f}>
											{f}
										</option>
									))}
								</select>
							</label>
							<label>
								Fuente del cuerpo
								<select
									value={config.fonts.body}
									onChange={(e) => updateFonts('body', e.target.value)}
								>
									{FONT_OPTIONS.map((f) => (
										<option key={f} value={f}>
											{f}
										</option>
									))}
								</select>
							</label>
							<label>
								Estilo de diseño
								<select
									value={config.layout}
									onChange={(e) =>
										updateConfig({ layout: e.target.value as TemplateConfig['layout'] })
									}
								>
									<option value="classic">Clásico</option>
									<option value="modern">Moderno</option>
									<option value="elegant">Elegante</option>
								</select>
							</label>
							<div className={`upload-section${hasBackgroundImage ? '' : ' editor-form-last'}`}>
								<label>Imagen de fondo</label>
								<BackgroundPicker
									config={config}
									previewImageUrl={previewImageUrl}
									onSelect={selectStockBackground}
									onClear={clearBackgroundImage}
								/>
								{hasBackgroundImage && (
									<p className="upload-status text-muted">
										{hasCustomBackground
											? 'Usando tu foto personalizada'
											: 'Usando imagen de fondo seleccionada'}
									</p>
								)}
								<input
									ref={fileRef}
									type="file"
									accept="image/jpeg,image/png,image/webp"
									hidden
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) void handleUpload(file);
									}}
								/>
								<div className="upload-actions">
									<button
										type="button"
										className="btn btn-secondary"
										disabled={uploading}
										onClick={() => fileRef.current?.click()}
									>
										{uploading ? 'Subiendo...' : hasBackgroundImage ? 'Cambiar foto' : 'Subir foto'}
									</button>
									{hasBackgroundImage && (
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											onClick={clearBackgroundImage}
										>
											Quitar imagen
										</button>
									)}
								</div>
							</div>
							{hasBackgroundImage && (
								<div className="bg-position-controls editor-form-last">
									<p className="bg-position-label">Posición de la imagen</p>
									<p className="bg-position-hint">
										Arrastra sobre la vista previa o usa los controles
									</p>
									<label>
										Horizontal ({config.backgroundPositionX ?? 50}%)
										<input
											type="range"
											min={0}
											max={100}
											value={config.backgroundPositionX ?? 50}
											onChange={(e) =>
												updateConfig({ backgroundPositionX: Number(e.target.value) })
											}
										/>
									</label>
									<label>
										Vertical ({config.backgroundPositionY ?? 50}%)
										<input
											type="range"
											min={0}
											max={100}
											value={config.backgroundPositionY ?? 50}
											onChange={(e) =>
												updateConfig({ backgroundPositionY: Number(e.target.value) })
											}
										/>
									</label>
									<div className="bg-position-presets">
										{[
											{ label: 'Centro', x: 50, y: 50 },
											{ label: 'Arriba', x: 50, y: 0 },
											{ label: 'Abajo', x: 50, y: 100 },
											{ label: 'Izq.', x: 0, y: 50 },
											{ label: 'Der.', x: 100, y: 50 },
										].map((preset) => (
											<button
												key={preset.label}
												type="button"
												className="btn btn-ghost btn-sm"
												onClick={() =>
													updateConfig({
														backgroundPositionX: preset.x,
														backgroundPositionY: preset.y,
													})
												}
											>
												{preset.label}
											</button>
										))}
									</div>
								</div>
							)}
						</CollapsibleSection>
					</form>
				</div>
			</main>

			<div className="editor-mobile-bar" aria-label="Acciones">
				<button
					type="button"
					className="btn btn-secondary"
					disabled={saving}
					onClick={() => void handleSave()}
				>
					{saving ? 'Guardando...' : 'Guardar'}
				</button>
				<button
					type="button"
					className="btn btn-primary"
					disabled={publishing}
					onClick={() => void handlePublish()}
				>
					{publishing ? 'Publicando...' : invitation.status === 'published' ? 'Republicar' : 'Publicar'}
				</button>
			</div>
		</div>
	);
}
