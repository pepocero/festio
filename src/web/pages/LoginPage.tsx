import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			await login(email, password);
			navigate('/app');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>Invitaciones</h1>
				<p className="auth-subtitle">Crea y comparte invitaciones digitales</p>
				<form onSubmit={(e) => void handleSubmit(e)}>
					{error && <div className="error-banner">{error}</div>}
					<label>
						Email
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
					</label>
					<label>
						Contraseña
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
						/>
					</label>
					<button type="submit" className="btn btn-primary btn-block" disabled={loading}>
						{loading ? 'Entrando...' : 'Iniciar sesión'}
					</button>
				</form>
				<p className="auth-footer">
					¿No tienes cuenta? <Link to="/register">Regístrate</Link>
				</p>
			</div>
		</div>
	);
}
