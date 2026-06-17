import type { Invitation, TemplateConfig } from '@shared/types';
import {
	buildGoogleCalendarUrl,
	defaultEndDate,
	escapeHtml,
	formatEventDate,
	googleFontsLink,
	hexToRgba,
	mergeConfig,
	parseTemplateConfig,
	resolveBackgroundPosition,
	resolveHostFontSize,
	resolveOgImage,
} from '@shared/utils';

export function renderPublicInvitationHtml(params: {
	invitation: Invitation;
	templateDefaultConfig: string;
	appUrl: string;
}): string {
	const { invitation, templateDefaultConfig, appUrl } = params;
	const baseConfig = parseTemplateConfig(templateDefaultConfig);
	const userConfig = parseTemplateConfig(invitation.config || '{}');
	const config: TemplateConfig = mergeConfig(baseConfig, userConfig);

	const publicUrl = `${appUrl}/i/${invitation.public_slug}`;
	const bgUrl = config.customBackgroundKey
		? `${appUrl}/media/${config.customBackgroundKey}`
		: config.backgroundImage?.startsWith('/')
			? `${appUrl}${config.backgroundImage}`
			: config.backgroundImage ?? '';

	const title = invitation.title || 'Invitación';
	const description =
		invitation.message ||
		`${invitation.host_name ? `Organiza: ${invitation.host_name}. ` : ''}Te invitamos a nuestro evento.`;

	const og = resolveOgImage({
		appUrl,
		customBackgroundKey: config.customBackgroundKey,
		backgroundImage: config.backgroundImage,
	});
	const fontsLink = googleFontsLink(config);

	const eventDateFormatted = formatEventDate(invitation.event_date, invitation.timezone);
	const calendarUrl =
		invitation.event_date
			? buildGoogleCalendarUrl({
					title,
					startIso: invitation.event_date,
					endIso: invitation.event_end_date ?? defaultEndDate(invitation.event_date),
					timezone: invitation.timezone,
					location: invitation.location,
					details: `${invitation.message}\n\nVer invitación: ${publicUrl}`,
				})
			: null;

	const layoutClass = `layout-${config.layout}`;
	const hostFontSize = resolveHostFontSize(config);
	const bgPos = resolveBackgroundPosition(config);

	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Festio" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(publicUrl)}" />
  <meta property="og:image" content="${escapeHtml(og.url)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(og.url)}" />
  <meta property="og:image:type" content="${escapeHtml(og.type)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(og.url)}" />
  <link rel="canonical" href="${escapeHtml(publicUrl)}" />
  ${fontsLink ? `<link rel="stylesheet" href="${fontsLink}" />` : ''}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${config.fonts.body}', Georgia, serif;
      background: ${config.colors.background};
      color: ${config.colors.text};
      min-height: 100dvh;
      line-height: 1.6;
    }
    .page {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem 2rem;
    }
    .card {
      width: 100%;
      max-width: 480px;
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      background: #fff;
    }
    .card-hero {
      min-height: 220px;
      background-size: cover;
      background-position: ${bgPos.x}% ${bgPos.y}%;
      background-repeat: no-repeat;
      ${bgUrl ? `background-image: linear-gradient(${hexToRgba(config.colors.primary, 0.55)}, ${hexToRgba(config.colors.secondary, 0.55)}), url('${escapeHtml(bgUrl)}');` : `background: linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary});`}
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
    }
    .card-hero h1 {
      font-family: '${config.fonts.title}', serif;
      font-size: 2rem;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
      line-height: 1.2;
    }
    .card-body { padding: 1.75rem 1.5rem; }
    .host { color: ${config.colors.primary}; font-weight: 600; margin-bottom: 0.5rem; font-size: ${hostFontSize}px; }
    .host-label { opacity: 0.9; }
    .date {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1rem 0;
      padding: 0.75rem 1rem;
      background: ${config.colors.background};
      border-radius: 0.75rem;
      border-left: 4px solid ${config.colors.primary};
    }
    .location { margin: 0.75rem 0; opacity: 0.9; }
    .message { margin-top: 1rem; font-style: italic; opacity: 0.85; }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.75rem;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:active { transform: scale(0.98); }
    .btn-calendar {
      background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
      text-decoration: none;
    }
    .btn-calendar:hover {
      background: linear-gradient(135deg, #6d28d9 0%, #db2777 100%);
      color: #fff;
    }
    .layout-elegant .card { border: 2px solid ${config.colors.secondary}; }
    .layout-modern .card { border-radius: 0.5rem; }
    .layout-classic .card-hero h1 { font-size: 2.25rem; }
    .footer { margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.5; text-align: center; }
  </style>
</head>
<body class="${layoutClass}">
  <div class="page">
    <article class="card">
      <header class="card-hero">
        <h1>${escapeHtml(title)}</h1>
      </header>
      <div class="card-body">
        ${invitation.host_name ? `<p class="host"><span class="host-label">Organiza:</span> ${escapeHtml(invitation.host_name)}</p>` : ''}
        <p class="date">📅 ${escapeHtml(eventDateFormatted)}</p>
        ${invitation.location ? `<p class="location">📍 ${escapeHtml(invitation.location)}</p>` : ''}
        ${invitation.message ? `<p class="message">${escapeHtml(invitation.message)}</p>` : ''}
        ${calendarUrl ? `<div class="actions">
          <a class="btn btn-calendar" href="${escapeHtml(calendarUrl)}" target="_blank" rel="noopener noreferrer">📅 Añadir a Google Calendar</a>
        </div>` : ''}
      </div>
    </article>
    <p class="footer">Invitación digital</p>
  </div>
</body>
</html>`;
}
