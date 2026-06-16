import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Invitation } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getHeroBackgroundStyle } from '../lib/invitationStyle';
import { ShareButtons } from '../components/ShareButtons';

export function DashboardPage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = async () => {
		try {
			const { invitations: list } = await api.getInvitations();
			setInvitations(list);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al cargar');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm('¿Eliminar esta invitación?')) return;
		await api.deleteInvitation(id);
		setInvitations((prev) => prev.filter((i) => i.id !== id));
	};

	const copyLink = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			alert('Enlace copiado');
		} catch {
			prompt('Copia este enlace:', url);
		}
	};

	return (
		<div className="app-layout">
			<header className="app-header">
				<div>
					<h1>Festio</h1>
					<p className="text-muted">Mis invitaciones · {user?.email}</p>
				</div>
				<div className="header-actions">
					<Link to="/app/new" className="btn btn-primary">
						+ Nueva invitación
					</Link>
					<button type="button" className="btn btn-ghost" onClick={() => void logout().then(() => navigate('/login'))}>
						Salir
					</button>
				</div>
			</header>

			<main className="app-main">
				{loading && <p>Cargando...</p>}
				{error && <div className="error-banner">{error}</div>}
				{!loading && invitations.length === 0 && (
					<div className="empty-state">
						<h2>Aún no tienes invitaciones</h2>
						<p>Crea tu primera invitación eligiendo una plantilla.</p>
						<Link to="/app/new" className="btn btn-primary">
							Crear invitación
						</Link>
					</div>
				)}
				<div className="invitation-grid">
					{invitations.map((inv) => (
						<article key={inv.id} className="invitation-card">
							<div
								className="invitation-card-preview"
								style={getHeroBackgroundStyle(inv.config)}
							>
								<span className={`badge badge-${inv.status}`}>
									{inv.status === 'published' ? 'Publicada' : 'Borrador'}
								</span>
								<h3>{inv.title}</h3>
							</div>
							<div className="invitation-card-body">
								<p className="text-muted">{inv.template_name}</p>
								{inv.event_date && (
									<p className="invitation-date">
										{new Date(inv.event_date).toLocaleDateString('es-ES', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}
									</p>
								)}
								<div className="card-actions">
									<Link to={`/app/edit/${inv.id}`} className="btn btn-secondary btn-sm">
										Editar
									</Link>
									{inv.public_url && (
										<>
											<button
												type="button"
												className="btn btn-secondary btn-sm"
												onClick={() => void copyLink(inv.public_url!)}
											>
												Copiar enlace
											</button>
											<a
												href={inv.public_url}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-ghost btn-sm"
											>
												Ver
											</a>
										</>
									)}
									<button
										type="button"
										className="btn btn-danger btn-sm"
										onClick={() => void handleDelete(inv.id)}
									>
										Eliminar
									</button>
								</div>
								{inv.public_url && inv.status === 'published' && (
									<div className="card-share">
										<ShareButtons url={inv.public_url} title={inv.title} />
									</div>
								)}
							</div>
						</article>
					))}
				</div>
			</main>
		</div>
	);
}
