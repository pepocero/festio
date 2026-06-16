import { useId, useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
	const [open, setOpen] = useState(defaultOpen);
	const panelId = useId();

	return (
		<section className={`collapsible-section${open ? ' is-open' : ''}`}>
			<button
				type="button"
				className="collapsible-trigger"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-controls={panelId}
			>
				<span className="collapsible-title">{title}</span>
				<span className="collapsible-chevron" aria-hidden>
					{open ? '−' : '+'}
				</span>
			</button>
			<div id={panelId} className="collapsible-panel" hidden={!open}>
				<div className="collapsible-content">{children}</div>
			</div>
		</section>
	);
}
