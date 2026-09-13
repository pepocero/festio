import {
	DEFAULT_VIP_CORNER,
	DEFAULT_VIP_SIZE,
	DEFAULT_VIP_STYLE,
	MAX_VIP_SIZE,
	MIN_VIP_SIZE,
	VIP_CORNERS,
	VIP_STYLES,
	type VipCorner,
	type VipStyleId,
} from '@shared/vipStyles';
import type { TemplateConfig } from '../lib/api';
import { CornerIcon } from './icons';

const CORNER_LABELS: Record<VipCorner, string> = {
	'top-left': 'Esquina superior izquierda',
	'top-right': 'Esquina superior derecha',
	'bottom-left': 'Esquina inferior izquierda',
	'bottom-right': 'Esquina inferior derecha',
};

interface VipBadgePickerProps {
	config: TemplateConfig;
	onChange: (partial: Partial<TemplateConfig>) => void;
}

export function VipBadgePicker({ config, onChange }: VipBadgePickerProps) {
	const enabled = config.vipEnabled ?? false;
	const activeStyle = config.vipStyle ?? DEFAULT_VIP_STYLE;
	const activeCorner = config.vipCorner ?? DEFAULT_VIP_CORNER;
	const activeSize = config.vipSize ?? DEFAULT_VIP_SIZE;

	return (
		<div className="vip-picker">
			<p className="bg-position-label">Invitado VIP</p>
			<p className="bg-position-hint">
				Añade un sello elegante en una esquina. Actívalo solo si quieres que se vea.
			</p>
			<label className="toggle-option">
				<input
					type="checkbox"
					checked={enabled}
					onChange={(e) =>
						onChange({
							vipEnabled: e.target.checked,
							vipStyle: config.vipStyle ?? DEFAULT_VIP_STYLE,
							vipCorner: config.vipCorner ?? DEFAULT_VIP_CORNER,
							vipSize: config.vipSize ?? DEFAULT_VIP_SIZE,
						})
					}
				/>
				<span className="toggle-option-text">Mostrar sello VIP</span>
			</label>
			{enabled && (
				<>
					<p className="vip-picker-subtitle">Formato</p>
					<div className="vip-picker-grid">
						{VIP_STYLES.map((style) => (
							<button
								key={style.id}
								type="button"
								className={`vip-picker-item${activeStyle === style.id ? ' is-active' : ''}`}
								onClick={() => onChange({ vipStyle: style.id as VipStyleId })}
								aria-pressed={activeStyle === style.id}
								title={style.label}
							>
								{style.overlay ? (
									<span className="vip-picker-overlay">
										<img src={style.url} alt="" className="vip-picker-overlay-art" loading="lazy" />
										<img src="/vip/laurel-gold.svg" alt="" className="vip-picker-overlay-disc" />
									</span>
								) : (
									<img src={style.url} alt="" loading="lazy" />
								)}
								<span className="vip-picker-label">{style.label}</span>
							</button>
						))}
					</div>
					<label>
						Tamaño ({activeSize}%)
						<input
							type="range"
							min={MIN_VIP_SIZE}
							max={MAX_VIP_SIZE}
							value={activeSize}
							onChange={(e) => onChange({ vipSize: Number(e.target.value) })}
						/>
					</label>
					<p className="vip-picker-subtitle">Esquina</p>
					<div className="vip-corner-grid" role="group" aria-label="Esquina del sello VIP">
						{VIP_CORNERS.map((corner) => (
							<button
								key={corner}
								type="button"
								className={`btn btn-ghost btn-icon vip-corner-btn${activeCorner === corner ? ' is-active' : ''}`}
								onClick={() => onChange({ vipCorner: corner })}
								aria-pressed={activeCorner === corner}
								aria-label={CORNER_LABELS[corner]}
								title={CORNER_LABELS[corner]}
							>
								<CornerIcon corner={corner} />
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}
