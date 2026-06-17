import { useEffect, useRef, useState } from 'react';

interface ColorSwatchFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}

const DEBOUNCE_MS = 80;

export function ColorSwatchField({ id, label, value, onChange }: ColorSwatchFieldProps) {
	const [local, setLocal] = useState(value);
	const pendingRef = useRef<string | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>();
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		setLocal(value);
	}, [value]);

	const flush = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
		}
		if (pendingRef.current !== null) {
			const next = pendingRef.current;
			pendingRef.current = null;
			onChangeRef.current(next);
		}
	};

	const schedule = (next: string) => {
		pendingRef.current = next;
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(flush, DEBOUNCE_MS);
	};

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);

	return (
		<div className="color-field">
			<label className="color-field-label" htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				type="color"
				className="color-swatch"
				value={local}
				onInput={(e) => {
					const next = e.currentTarget.value;
					setLocal(next);
					schedule(next);
				}}
				onPointerUp={flush}
				onBlur={flush}
			/>
		</div>
	);
}
