import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Template } from '../lib/api';

const CATEGORY_LABELS: Record<string, string> = {
	cumpleanos: 'Cumpleaños',
	boda: 'Bodas',
	cena: 'Cenas',
	generico: 'Eventos',
};

export function NewInvitationPage() {
	const navigate = useNavigate();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [filter, setFilter] = useState<string>('all');

	useEffect(() => {
		api
			.getTemplates()
			.then(({ templates: t }) => setTemplates(t))
			.catch((err) => setError(err instanceof Error ? err.message : 'Error'))
			.finally(() => setLoading(false));
	}, []);

	const handleSelect = async (templateId: string) => {
		setCreating(templateId);
		setError('');
		try {
			const { invitation } = await api.createInvitation(templateId);
			navigate(`/app/edit/${invitation.id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al crear');
			setCreating(null);
		}
	};

	const filtered =
		filter === 'all' ? templates : templates.filter((t) => t.category === filter);

	const categories = [...new Set(templates.map((t) => t.category))];

	return (
		<div className="app-layout">
			<header className="app-header">
				<div>
					<Link to="/app" className="back-link">
						← Volver
					</Link>
					<h1>Elige una plantilla</h1>
				</div>
			</header>
			<main className="app-main">
				{error && <div className="error-banner">{error}</div>}
				<div className="filter-tabs">
					<button
						type="button"
						className={filter === 'all' ? 'active' : ''}
						onClick={() => setFilter('all')}
					>
						Todas
					</button>
					{categories.map((cat) => (
						<button
							key={cat}
							type="button"
							className={filter === cat ? 'active' : ''}
							onClick={() => setFilter(cat)}
						>
							{CATEGORY_LABELS[cat] ?? cat}
						</button>
					))}
				</div>
				{loading && <p>Cargando plantillas...</p>}
				<div className="template-grid">
					{filtered.map((tpl) => (
						<button
							key={tpl.id}
							type="button"
							className="template-card"
							disabled={creating !== null}
							onClick={() => void handleSelect(tpl.id)}
						>
							<div
								className="template-preview"
								style={{
									background: `linear-gradient(135deg, ${tpl.default_config.colors.primary}, ${tpl.default_config.colors.secondary})`,
								}}
							>
								{tpl.preview_image_key && (
									<img src={tpl.preview_image_key} alt="" aria-hidden />
								)}
							</div>
							<div className="template-info">
								<span className="template-category">
									{CATEGORY_LABELS[tpl.category] ?? tpl.category}
								</span>
								<h3>{tpl.name}</h3>
							</div>
							{creating === tpl.id && <span className="creating-label">Creando...</span>}
						</button>
					))}
				</div>
			</main>
		</div>
	);
}
