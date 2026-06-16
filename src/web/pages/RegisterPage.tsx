import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function RegisterPage() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');
		if (password !== confirm) {
			setError('Las contraseñas no coinciden');
			return;
		}
		if (password.length < 8) {
			setError('La contraseña debe tener al menos 8 caracteres');
			return;
		}
		setLoading(true);
		try {
			await register(email, password);
			navigate('/app');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al registrarse');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>Festio</h1>
				<p className="auth-subtitle">Crea tu cuenta y empieza a diseñar invitaciones</p>
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
							minLength={8}
							autoComplete="new-password"
						/>
					</label>
					<label>
						Confirmar contraseña
						<input
							type="password"
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
							required
							autoComplete="new-password"
						/>
					</label>
					<button type="submit" className="btn btn-primary btn-block" disabled={loading}>
						{loading ? 'Creando cuenta...' : 'Registrarse'}
					</button>
				</form>
				<p className="auth-footer">
					¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
				</p>
			</div>
		</div>
	);
}
