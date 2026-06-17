import { STOCK_BACKGROUNDS } from '@shared/stockBackgrounds';
import type { TemplateConfig } from '../lib/api';

interface BackgroundPickerProps {
	config: TemplateConfig;
	previewImageUrl?: string | null;
	onSelect: (url: string) => void;
	onClear: () => void;
}

function resolveActiveBackgroundUrl(
	config: TemplateConfig,
	previewImageUrl?: string | null,
): string | null {
	if (previewImageUrl || config.customBackgroundKey) return null;
	return config.backgroundImage || null;
}

export function BackgroundPicker({
	config,
	previewImageUrl,
	onSelect,
	onClear,
}: BackgroundPickerProps) {
	const activeUrl = resolveActiveBackgroundUrl(config, previewImageUrl);
	const usingCustom = !!(previewImageUrl || config.customBackgroundKey);

	return (
		<div className="background-picker">
			<p className="background-picker-hint text-muted">
				Fondos incluidos en la app. Tus fotos subidas se guardan aparte en almacenamiento privado.
			</p>
			<div className="background-picker-grid">
				<button
					type="button"
					className={`background-picker-item${!activeUrl && !usingCustom ? ' is-active' : ''}`}
					onClick={onClear}
					aria-pressed={!activeUrl && !usingCustom}
				>
					<span className="background-picker-none">Sin imagen</span>
				</button>
				{STOCK_BACKGROUNDS.map((bg) => (
					<button
						key={bg.id}
						type="button"
						className={`background-picker-item${activeUrl === bg.url ? ' is-active' : ''}`}
						onClick={() => onSelect(bg.url)}
						aria-pressed={activeUrl === bg.url}
						title={bg.label}
					>
						<img src={bg.url} alt="" loading="lazy" />
						<span className="background-picker-label">{bg.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}
