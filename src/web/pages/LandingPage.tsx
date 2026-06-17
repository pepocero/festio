import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const FEATURES = [
	{
		icon: '🎨',
		title: 'Plantillas profesionales',
		description:
			'Bodas, cumpleaños, cenas y eventos. Elige un diseño y adáptalo a tu estilo en minutos.',
	},
	{
		icon: '✨',
		title: 'Personalización total',
		description:
			'Colores, fuentes, imágenes de fondo y textos. Tu invitación, con tu identidad.',
	},
	{
		icon: '📱',
		title: 'Comparte al instante',
		description:
			'Envía por WhatsApp, email o enlace. Vista previa optimizada para que luzca perfecta en el móvil.',
	},
	{
		icon: '📅',
		title: 'Google Calendar',
		description:
			'Tus invitados añaden el evento a su calendario con un solo toque.',
	},
];

const STEPS = [
	{ num: '1', title: 'Crea tu cuenta', text: 'Regístrate gratis y accede a tu panel personal.' },
	{ num: '2', title: 'Diseña la invitación', text: 'Elige plantilla, edita textos, fecha y personaliza el diseño.' },
	{ num: '3', title: 'Publica y comparte', text: 'Obtén un enlace único y envíalo solo a quien tú decidas.' },
];

export function LandingPage() {
	const { user } = useAuth();

	return (
		<div className="landing-page">
			<header className="landing-header">
				<div className="landing-header-inner">
					<Link to="/" className="landing-logo">
						Festio
					</Link>
					<nav className="landing-nav" aria-label="Acceso">
						{user ? (
							<>
								<Link to="/app" className="btn btn-secondary btn-sm">
									Mis invitaciones
								</Link>
								<Link to="/app/new" className="btn btn-view-invitation btn-sm">
									Nueva invitación
								</Link>
							</>
						) : (
							<>
								<Link to="/login" className="btn btn-secondary btn-sm">
									Iniciar sesión
								</Link>
								<Link to="/register" className="btn btn-view-invitation btn-sm">
									Crear cuenta
								</Link>
							</>
						)}
					</nav>
				</div>
			</header>

			<section className="landing-hero-section">
				<div className="landing-hero">
				<div className="landing-hero-inner">
					<p className="landing-eyebrow">Invitaciones digitales</p>
					<h1>
						Crea invitaciones memorables
						<span className="landing-hero-accent"> en minutos</span>
					</h1>
					<p className="landing-hero-lead">
						Festio es la plataforma para diseñar, personalizar y compartir invitaciones
						digitales de cumpleaños, bodas, cenas y eventos. Elegante, rápido y pensado
						para el móvil.
					</p>
					<div className="landing-hero-cta">
						{user ? (
							<>
								<Link to="/app" className="btn btn-view-invitation btn-lg">
									Ir a mis invitaciones
								</Link>
								<Link to="/app/new" className="btn btn-secondary btn-lg">
									Crear invitación
								</Link>
							</>
						) : (
							<>
								<Link to="/register" className="btn btn-view-invitation btn-lg">
									Empezar gratis
								</Link>
								<Link to="/login" className="btn btn-secondary btn-lg">
									Ya tengo cuenta
								</Link>
							</>
						)}
					</div>
					<ul className="landing-hero-tags" aria-label="Tipos de evento">
						<li>Cumpleaños</li>
						<li>Bodas</li>
						<li>Cenas</li>
						<li>Eventos</li>
					</ul>
				</div>
				<div className="landing-hero-visual" aria-hidden="true">
					<div className="landing-mockup">
						<div className="landing-mockup-hero" />
						<div className="landing-mockup-body">
							<div className="landing-mockup-line landing-mockup-line--title" />
							<div className="landing-mockup-line" />
							<div className="landing-mockup-line landing-mockup-line--short" />
							<div className="landing-mockup-btn" />
						</div>
					</div>
				</div>
				</div>
			</section>

			<section className="landing-section" id="caracteristicas">
				<div className="landing-section-inner">
					<h2 className="landing-section-title">Todo lo que necesitas para tu evento</h2>
					<p className="landing-section-lead">
						Una herramienta completa para organizadores que quieren invitaciones con
						aspecto profesional, sin complicaciones técnicas.
					</p>
					<div className="landing-features">
						{FEATURES.map((f) => (
							<article key={f.title} className="landing-feature-card">
								<span className="landing-feature-icon" aria-hidden="true">
									{f.icon}
								</span>
								<h3>{f.title}</h3>
								<p>{f.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="landing-section landing-section--alt">
				<div className="landing-section-inner">
					<h2 className="landing-section-title">Cómo funciona</h2>
					<ol className="landing-steps">
						{STEPS.map((s) => (
							<li key={s.num} className="landing-step">
								<span className="landing-step-num">{s.num}</span>
								<div>
									<h3>{s.title}</h3>
									<p>{s.text}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="landing-cta">
				<div className="landing-cta-inner">
					<h2>¿Listo para tu próximo evento?</h2>
					<p>Crea tu primera invitación digital y compártela con quien quieras.</p>
					<div className="landing-hero-cta">
						{user ? (
							<>
								<Link to="/app/new" className="btn btn-view-invitation btn-lg">
									Crear invitación
								</Link>
								<Link to="/app" className="btn btn-landing-outline btn-lg">
									Mis invitaciones
								</Link>
							</>
						) : (
							<>
								<Link to="/register" className="btn btn-view-invitation btn-lg">
									Crear mi invitación
								</Link>
								<Link to="/login" className="btn btn-landing-outline btn-lg">
									Acceder
								</Link>
							</>
						)}
					</div>
				</div>
			</section>

			<footer className="landing-footer">
				<p className="landing-footer-brand">Festio</p>
				<p className="landing-footer-copy">Invitaciones digitales · Hecho para celebrar</p>
				<p className="landing-footer-credit">
					App creada por{' '}
					<a href="https://carlinitools.com" target="_blank" rel="noopener noreferrer">
						CarliniTools
					</a>
				</p>
			</footer>
		</div>
	);
}
