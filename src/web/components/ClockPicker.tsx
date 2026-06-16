import { useEffect, useRef, useState } from 'react';

interface ClockPickerProps {
	value: string;
	onChange: (time: string) => void;
	label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function parseTime(value: string): { hour: number; minute: number } {
	if (!value) return { hour: 12, minute: 0 };
	const [h, m] = value.split(':').map(Number);
	return { hour: Number.isFinite(h) ? h : 12, minute: Number.isFinite(m) ? m : 0 };
}

function formatTime(hour: number, minute: number): string {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function hourOnCircle(index: number, total: number, radius: number, cx: number, cy: number) {
	const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
	return {
		x: cx + radius * Math.cos(angle),
		y: cy + radius * Math.sin(angle),
	};
}

export function ClockPicker({ value, onChange, label = 'Hora' }: ClockPickerProps) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<'hour' | 'minute'>('hour');
	const { hour, minute } = parseTime(value);
	const [draftHour, setDraftHour] = useState(hour);
	const [draftMinute, setDraftMinute] = useState(minute);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const { hour: h, minute: m } = parseTime(value);
		setDraftHour(h);
		setDraftMinute(m);
	}, [value]);

	useEffect(() => {
		if (!open) return;
		const onClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
				setMode('hour');
			}
		};
		document.addEventListener('mousedown', onClickOutside);
		return () => document.removeEventListener('mousedown', onClickOutside);
	}, [open]);

	const display = value || 'Seleccionar hora';
	const cx = 120;
	const cy = 120;
	const radius = 88;

	const handleHourSelect = (h: number) => {
		setDraftHour(h);
		setMode('minute');
	};

	const handleMinuteSelect = (m: number) => {
		setDraftMinute(m);
		onChange(formatTime(draftHour, m));
		setOpen(false);
		setMode('hour');
	};

	const handAngle =
		mode === 'hour'
			? (draftHour / 24) * 360 - 90
			: (draftMinute / 60) * 360 - 90;

	return (
		<div className="clock-picker" ref={containerRef}>
			<span className="clock-picker-label">{label}</span>
			<button
				type="button"
				className="clock-picker-trigger"
				onClick={() => {
					setOpen((o) => !o);
					setMode('hour');
				}}
				aria-expanded={open}
			>
				<span className="clock-picker-icon" aria-hidden>
					🕐
				</span>
				{display}
			</button>

			{open && (
				<div className="clock-picker-panel" role="dialog" aria-label="Seleccionar hora">
					<div className="clock-picker-header">
						<span className="clock-picker-mode">
							{mode === 'hour' ? 'Selecciona la hora' : 'Selecciona los minutos'}
						</span>
						<span className="clock-picker-digital">
							{formatTime(draftHour, draftMinute)}
						</span>
					</div>
					<svg className="clock-face" viewBox="0 0 240 240" role="img" aria-hidden>
						<circle cx={cx} cy={cy} r={radius + 8} className="clock-face-bg" />
						<line
							x1={cx}
							y1={cy}
							x2={cx + (radius - 28) * Math.cos((handAngle * Math.PI) / 180)}
							y2={cy + (radius - 28) * Math.sin((handAngle * Math.PI) / 180)}
							className="clock-hand"
						/>
						<circle cx={cx} cy={cy} r={6} className="clock-center" />
						{mode === 'hour'
							? HOURS.map((h) => {
									const pos = hourOnCircle(h, 24, radius - 20, cx, cy);
									const selected = h === draftHour;
									return (
										<g key={h}>
											<circle
												cx={pos.x}
												cy={pos.y}
												r={selected ? 18 : 14}
												className={selected ? 'clock-num-bg selected' : 'clock-num-bg'}
												onClick={() => handleHourSelect(h)}
											/>
											<text
												x={pos.x}
												y={pos.y + 5}
												textAnchor="middle"
												className={selected ? 'clock-num selected' : 'clock-num'}
												onClick={() => handleHourSelect(h)}
											>
												{h}
											</text>
										</g>
									);
								})
							: MINUTES.map((m, i) => {
									const pos = hourOnCircle(i, 12, radius - 20, cx, cy);
									const selected = m === draftMinute;
									return (
										<g key={m}>
											<circle
												cx={pos.x}
												cy={pos.y}
												r={selected ? 18 : 14}
												className={selected ? 'clock-num-bg selected' : 'clock-num-bg'}
												onClick={() => handleMinuteSelect(m)}
											/>
											<text
												x={pos.x}
												y={pos.y + 5}
												textAnchor="middle"
												className={selected ? 'clock-num selected' : 'clock-num'}
												onClick={() => handleMinuteSelect(m)}
											>
												{String(m).padStart(2, '0')}
											</text>
										</g>
									);
								})}
					</svg>
					{mode === 'minute' && (
						<button
							type="button"
							className="btn btn-ghost btn-sm clock-back"
							onClick={() => setMode('hour')}
						>
							← Cambiar hora
						</button>
					)}
				</div>
			)}
		</div>
	);
}
