import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const HELP_SECTIONS = [
	{
		id: 'acceso',
		title: 'Dónde personalizar tu invitación',
		steps: [
			'Entra en Mis invitaciones y abre una invitación existente, o crea una nueva desde una plantilla.',
			'En el editor verás la vista previa a la izquierda (o arriba en móvil) y el formulario a la derecha.',
			'Abre la sección Personalización: ahí están todos los controles de diseño de la tarjeta.',
			'Los cambios se ven al instante en la vista previa. Pulsa Guardar para no perderlos.',
		],
	},
	{
		id: 'colores',
		title: 'Colores de la tarjeta',
		steps: [
			'Color cabecera: tono principal de la franja superior y acentos (por ejemplo, el nombre del organizador o el borde de la fecha).',
			'Color fondo: color del cuerpo de la invitación, detrás de la fecha, el lugar y el mensaje.',
			'Color texto: color de la letra en el cuerpo de la tarjeta.',
			'Toca cada muestra de color para abrir el selector y elegir el tono que quieras.',
		],
	},
	{
		id: 'degradado-filtro',
		title: 'Degradado y filtro sobre la imagen',
		steps: [
			'Degradado cabecera: si está activo, la cabecera usa un degradado entre el color cabecera y el color degradado (aparece al activarlo).',
			'Sin imagen de fondo, el degradado sustituye el color plano de la cabecera.',
			'Filtro color en imagen: solo cuando hay imagen de fondo. Aplica un velo con tus colores para que el título se lea mejor.',
			'Puedes combinar degradado y filtro para lograr el estilo que busques.',
		],
	},
	{
		id: 'fuentes',
		title: 'Fuentes del título y del cuerpo',
		steps: [
			'Fuente del título: tipografía del nombre del evento en la cabecera.',
			'Fuente del cuerpo: tipografía de la fecha, lugar, mensaje y demás textos.',
			'Hay estilos clásicos, modernos, cursivos y decorativos (cómic, desgastada, etc.).',
			'Prueba distintas combinaciones hasta que encaje con tu evento.',
		],
	},
	{
		id: 'titulo',
		title: 'Posición del título',
		steps: [
			'En Personalización, bloque Posición del título, activa Activar mover título.',
			'Arrastra el título en la vista previa o usa los deslizadores horizontal y vertical.',
			'Los botones Centro, Arriba, Abajo, Izq. y Der. colocan el título en un punto rápido.',
			'Desactiva el modo mover cuando termines para no moverlo por accidente al deslizar en móvil.',
		],
	},
	{
		id: 'estilo',
		title: 'Estilo de diseño',
		steps: [
			'Clásico: bordes redondeados y aspecto tradicional.',
			'Moderno: líneas más rectas y título en mayúsculas.',
			'Elegante: marco fino y tipografía más formal.',
			'El estilo afecta a toda la tarjeta, no solo a la cabecera.',
		],
	},
	{
		id: 'fondo',
		title: 'Imagen de fondo',
		steps: [
			'Elige un fondo incluido en la galería (confetti, floral, noche, minimal, etc.) o sube tu propia foto.',
			'Formatos admitidos: JPEG, PNG y WebP. La imagen se comprime al subir para cargar más rápido.',
			'Tus fotos se guardan en tu cuenta; los fondos incluidos no ocupan tu almacenamiento.',
			'Quitar imagen vuelve a la cabecera con color o degradado, sin foto.',
		],
	},
	{
		id: 'posicion-fondo',
		title: 'Posición de la imagen de fondo',
		steps: [
			'Solo disponible cuando hay imagen de fondo seleccionada o subida.',
			'Activa Activar mover fondo en Posición de la imagen.',
			'Arrastra en la vista previa (fuera del título) o ajusta con los deslizadores.',
			'Útil para encuadrar un detalle (por ejemplo, la luna en un fondo nocturno). Desactiva el modo al terminar.',
		],
	},
	{
		id: 'publicar',
		title: 'Guardar, publicar y compartir',
		steps: [
			'Guardar almacena los cambios en borrador; puedes seguir editando.',
			'Publicar genera el enlace público de la invitación.',
			'Desde el editor puedes copiar el enlace o compartir por WhatsApp, incluso como imagen.',
			'Tus invitados verán exactamente los colores, fuentes e imagen que hayas configurado.',
		],
	},
];

export function HelpPage() {
	const { user } = useAuth();

	return (
		<div className="landing-page help-page">
			<header className="landing-header">
				<div className="landing-header-inner">
					<Link to="/" className="landing-logo">
						Festio
					</Link>
					<nav className="landing-nav" aria-label="Navegación">
						<Link to="/" className="btn btn-ghost btn-sm">
							Inicio
						</Link>
						{user ? (
							<Link to="/app" className="btn btn-view-invitation btn-sm">
								Mis invitaciones
							</Link>
						) : (
							<Link to="/register" className="btn btn-view-invitation btn-sm">
								Crear cuenta
							</Link>
						)}
					</nav>
				</div>
			</header>

			<section className="help-hero">
				<div className="landing-section-inner">
					<p className="landing-eyebrow">Centro de ayuda</p>
					<h1>Cómo personalizar tu invitación</h1>
					<p className="help-hero-lead">
						Guía paso a paso para cambiar colores, fuentes, fondos y posiciones en el
						editor. Todo se configura en la sección <strong>Personalización</strong> de
						cada invitación.
					</p>
					<div className="help-toc" aria-label="Índice de contenidos">
						{HELP_SECTIONS.map((section) => (
							<a key={section.id} href={`#${section.id}`} className="help-toc-link">
								{section.title}
							</a>
						))}
					</div>
				</div>
			</section>

			<section className="landing-section landing-section--alt">
				<div className="landing-section-inner help-content">
					{HELP_SECTIONS.map((section) => (
						<article key={section.id} id={section.id} className="help-article">
							<h2>{section.title}</h2>
							<ol className="help-steps">
								{section.steps.map((step) => (
									<li key={step}>{step}</li>
								))}
							</ol>
						</article>
					))}
				</div>
			</section>

			<section className="landing-cta">
				<div className="landing-cta-inner">
					<h2>¿Listo para probarlo?</h2>
					<p>Crea o edita una invitación y abre Personalización en el editor.</p>
					<div className="landing-hero-cta">
						{user ? (
							<>
								<Link to="/app/new" className="btn btn-view-invitation btn-lg">
									Nueva invitación
								</Link>
								<Link to="/app" className="btn btn-landing-outline btn-lg">
									Mis invitaciones
								</Link>
							</>
						) : (
							<>
								<Link to="/register" className="btn btn-view-invitation btn-lg">
									Crear cuenta gratis
								</Link>
								<Link to="/login" className="btn btn-landing-outline btn-lg">
									Iniciar sesión
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
					<Link to="/">Volver al inicio</Link>
					{' · '}
					App creada por{' '}
					<a href="https://carlinitools.com" target="_blank" rel="noopener noreferrer">
						CarliniTools
					</a>
				</p>
			</footer>
		</div>
	);
}
