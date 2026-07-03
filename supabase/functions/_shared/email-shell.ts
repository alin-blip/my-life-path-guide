// Shared email shell used by sequence emails (bilingual RO/EN).
export type EmailLang = 'ro' | 'en';

export interface ShellOpts {
  title: string;
  headline: string;
  headerGradient: string; // e.g. 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  accent: string;         // main text/CTA accent color
  bodyHtml: string;       // arbitrary HTML for the middle section
  ctaLabel: string;
  ctaHref: string;
  nextTeaser?: string;    // "tomorrow" preview line
  unsubscribeUrl: string;
  trackingPixel: string;
  lang: EmailLang;
}

const t = (lang: EmailLang, ro: string, en: string) => (lang === 'en' ? en : ro);

export function renderSequenceEmail(opts: ShellOpts): string {
  const {
    title, headline, headerGradient, accent, bodyHtml, ctaLabel, ctaHref,
    nextTeaser, unsubscribeUrl, trackingPixel, lang,
  } = opts;

  const rights = t(lang, 'Toate drepturile rezervate.', 'All rights reserved.');
  const unsub = t(lang, 'Dezabonare', 'Unsubscribe');
  const tomorrow = t(lang, 'Mâine:', 'Tomorrow:');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: ${headerGradient}; padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 26px; color: #ffffff;">${title}</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">${headline}</p>
  </div>
  <div style="padding: 30px; color: #e5e7eb; line-height: 1.6;">
    ${bodyHtml}
    <div style="text-align: center; margin: 30px 0;">
      <a href="${ctaHref}" style="display: inline-block; padding: 15px 40px; background: ${headerGradient}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">${ctaLabel}</a>
    </div>
    ${nextTeaser ? `<p style="color: #888; font-size: 14px;">${tomorrow} ${nextTeaser}</p>` : ''}
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© ${new Date().getFullYear()} CEO Mind OS. ${rights}</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">${unsub}</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`;
}
