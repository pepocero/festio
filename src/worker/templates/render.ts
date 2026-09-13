import type { Invitation, TemplateConfig } from '@shared/types';
import {
	buildGoogleCalendarUrl,
	buildGoogleMapsUrl,
	buildCardHeroBackgroundCss,
	defaultEndDate,
	escapeHtml,
	formatEventDate,
	getHeroFillBackground,
	googleFontsLink,
	mergeConfig,
	parseTemplateConfig,
	resolveBackgroundPosition,
	resolveElegantBorderColor,
	resolveHostFontSize,
	resolveOgImage,
	resolveTitlePosition,
} from '@shared/utils';
import { resolveVipBadge, vipArtFlipClass } from '@shared/vipStyles';

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
	const mapsUrl = invitation.location ? buildGoogleMapsUrl(invitation.location) : null;

	const layoutClass = `layout-${config.layout}`;
	const hostFontSize = resolveHostFontSize(config);
	const bgPos = resolveBackgroundPosition(config);
	const titlePos = resolveTitlePosition(config);
	const elegantBorder = resolveElegantBorderColor(config);
	const heroBackgroundCss = bgUrl
		? buildCardHeroBackgroundCss(config, escapeHtml(bgUrl), bgPos)
		: `background: ${getHeroFillBackground(config)};`;
	const vipBadge = resolveVipBadge(config);
	const vipSrc = vipBadge ? `${appUrl}${vipBadge.url}` : '';
	const vipDiscSrc = vipBadge?.discUrl ? `${appUrl}${vipBadge.discUrl}` : '';
	const vipMarkup =
		vipBadge && vipBadge.overlay && vipDiscSrc
			? `<div class="vip-badge vip-badge--overlay vip-badge--${vipBadge.corner}" style="width:${vipBadge.size}%"><img class="vip-badge-art ${vipArtFlipClass(vipBadge.corner)}" src="${escapeHtml(vipSrc)}" alt="" /><img class="vip-badge-disc" src="${escapeHtml(vipDiscSrc)}" alt="" /></div>`
			: vipBadge
				? `<img class="vip-badge vip-badge--${vipBadge.corner}" style="width:${vipBadge.size}%" src="${escapeHtml(vipSrc)}" alt="" />`
				: '';

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
    .vip-badge {
      position: absolute;
      z-index: 4;
      height: auto;
      pointer-events: none;
      display: block;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.22));
    }
    .vip-badge--top-left { top: 0.4rem; left: 0.4rem; }
    .vip-badge--top-right { top: 0.4rem; right: 0.4rem; }
    .vip-badge--bottom-left { bottom: 0.4rem; left: 0.4rem; }
    .vip-badge--bottom-right { bottom: 0.4rem; right: 0.4rem; }
    .vip-badge--overlay { filter: none; aspect-ratio: 1; overflow: visible; }
    .vip-badge-art { position: absolute; display: block; width: 100%; height: auto; }
    .vip-badge--top-left .vip-badge-art { top: 0; left: 0; }
    .vip-badge--top-right .vip-badge-art { top: 0; right: 0; }
    .vip-badge--bottom-left .vip-badge-art { bottom: 0; left: 0; }
    .vip-badge--bottom-right .vip-badge-art { bottom: 0; right: 0; }
    .vip-badge-art--flip-x { transform: scaleX(-1); }
    .vip-badge-art--flip-y { transform: scaleY(-1); }
    .vip-badge-art--flip-xy { transform: scale(-1); }
    .vip-badge-disc { position: absolute; width: 86%; height: auto; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.28)); }
    .vip-badge--top-left .vip-badge-disc { left: 0; top: 0; }
    .vip-badge--top-right .vip-badge-disc { right: 0; top: 0; }
    .vip-badge--bottom-left .vip-badge-disc { left: 0; bottom: 0; }
    .vip-badge--bottom-right .vip-badge-disc { right: 0; bottom: 0; }
    .card-hero {
      position: relative;
      min-height: 220px;
      ${heroBackgroundCss}
      padding: 0;
    }
    .card-hero h1 {
      position: absolute;
      left: ${titlePos.x}%;
      top: ${titlePos.y}%;
      transform: translate(-50%, -50%);
      max-width: calc(100% - 2rem);
      margin: 0;
      text-align: center;
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
    .location {
      display: flex;
      align-items: flex-start;
      gap: 0.45rem;
      margin: 0.75rem 0;
      opacity: 0.95;
    }
    .location-text { flex: 1; min-width: 0; }
    .location-nav {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.5rem 0.2rem 0.35rem;
      border-radius: 999px;
      color: #1a73e8;
      background: rgba(26, 115, 232, 0.12);
      text-decoration: none;
      font-size: 0.7rem;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }
    .location-nav:hover { background: rgba(26, 115, 232, 0.2); }
    .location-nav svg { display: block; width: 14px; height: 14px; }
    .message { margin-top: 1rem; font-style: italic; opacity: 0.85; white-space: pre-line; }
    .actions {
      display: flex;
      justify-content: center;
      margin-top: 1.25rem;
    }
    .btn-calendar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #fff;
      background: ${config.colors.primary};
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      text-decoration: none;
    }
    .btn-calendar:hover { filter: brightness(0.94); }
    .btn-calendar svg { display: block; }
    .layout-elegant .card { border: 2px solid ${elegantBorder}; border-radius: 0.25rem; box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
    .layout-modern .card { border-radius: 0.35rem; box-shadow: 0 10px 28px rgba(15,23,42,0.14); }
    .layout-modern .card-hero h1 { font-size: 1.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .layout-modern .card-body { padding: 1.5rem 1.35rem; }
    .layout-modern .date { border-left: none; border-radius: 0.35rem; }
    .layout-classic .card { border-radius: 1.25rem; }
    .layout-classic .card-hero h1 { font-size: 2.25rem; letter-spacing: 0.02em; }
    .layout-classic .date { border-left-width: 4px; }
    .layout-elegant .card-hero h1 { font-size: 2rem; letter-spacing: 0.04em; font-weight: 600; }
    .footer { margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.5; text-align: center; }
  </style>
</head>
<body class="${layoutClass}">
  <div class="page">
    <article class="card">
      <header class="card-hero">
        <h1>${escapeHtml(title)}</h1>
        ${vipMarkup}
      </header>
      <div class="card-body">
        ${invitation.host_name ? `<p class="host"><span class="host-label">Organiza:</span> ${escapeHtml(invitation.host_name)}</p>` : ''}
        <p class="date">📅 ${escapeHtml(eventDateFormatted)}</p>
        ${invitation.location?.trim()
					? `<p class="location"><span class="location-text">${escapeHtml(invitation.location)}</span>${
							mapsUrl
								? `<a class="location-nav" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" title="Cómo llegar"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1 4.15 20.7c-.28.62.4 1.22.96.9L12 18.05l6.89 3.55c.56.32 1.24-.28.96-.9L12 3.1z"/></svg>Cómo llegar</a>`
								: ''
						}</p>`
					: ''}
        ${invitation.message ? `<p class="message">${escapeHtml(invitation.message)}</p>` : ''}
        ${calendarUrl ? `<div class="actions">
          <a class="btn-calendar" href="${escapeHtml(calendarUrl)}" target="_blank" rel="noopener noreferrer" title="Agregar a Calendario"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>Agregar a Calendario</a>
        </div>` : ''}
      </div>
    </article>
    <p class="footer">Invitación digital</p>
  </div>
</body>
</html>`;
}
