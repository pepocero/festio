import { ClockPicker } from './ClockPicker';
import { combineDateAndTime } from '../lib/datetime';
import { useIsMobile } from '../lib/useIsMobile';

interface DateTimeFieldProps {
	label: string;
	timeLabel?: string;
	date: string;
	time: string;
	onDateChange: (date: string) => void;
	onTimeChange: (time: string) => void;
	optional?: boolean;
}

export function DateTimeField({
	label,
	timeLabel = 'Hora',
	date,
	time,
	onDateChange,
	onTimeChange,
	optional,
}: DateTimeFieldProps) {
	const isMobile = useIsMobile();

	return (
		<div className="datetime-field">
			<span className="datetime-field-label">
				{label}
				{optional && <span className="datetime-optional"> (opcional)</span>}
			</span>
			<div className="datetime-row">
				<label className="datetime-date">
					<span className="sr-only">Fecha</span>
					<input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
				</label>
				{isMobile ? (
					<label className="datetime-time">
						<span className="clock-picker-label">{timeLabel}</span>
						<input
							type="time"
							value={time}
							onChange={(e) => onTimeChange(e.target.value)}
						/>
					</label>
				) : (
					<ClockPicker value={time} onChange={onTimeChange} label={timeLabel} />
				)}
			</div>
		</div>
	);
}

export function dateTimeToIso(date: string, time: string): string | null {
	return combineDateAndTime(date, time);
}
