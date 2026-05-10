import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { LOCALES, getLocalizedUrl, type Locale } from '@/i18n/utils';

export const prerender = false;

const STATIC_PATHS: { path: string; priority: number; changefreq: string }[] = [
  { path: '/',              priority: 1.0, changefreq: 'weekly' },
  { path: '/par-namu',      priority: 0.8, changefreq: 'monthly' },
  { path: '/par-projektu',  priority: 0.8, changefreq: 'monthly' },
  { path: '/atteli',        priority: 0.6, changefreq: 'monthly' },
  { path: '/dzivokli',      priority: 0.9, changefreq: 'weekly' },
  { path: '/apdares',       priority: 0.6, changefreq: 'monthly' },
  { path: '/kontakti',      priority: 0.7, changefreq: 'monthly' },
];

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!),
  );
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://almahome.lv');
  const apartments = (await getCollection('apartments'))
    .map((x) => x.data)
    .sort((a, b) => a.number - b.number);

  const allPaths = [
    ...STATIC_PATHS,
    ...apartments.map((a) => ({
      path: `/dzivokli/${a.number}`,
      priority: 0.7,
      changefreq: 'weekly',
    })),
  ];

  const lastmod = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');

  for (const entry of allPaths) {
    for (const locale of LOCALES) {
      const localizedPath = getLocalizedUrl(entry.path, locale);
      const loc = new URL(localizedPath, origin).toString();

      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(loc)}</loc>`);
      lines.push(`    <lastmod>${lastmod}</lastmod>`);
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      // Alternate language versions of THIS url, including the canonical (per sitemap spec).
      for (const altLocale of LOCALES as readonly Locale[]) {
        const altUrl = new URL(getLocalizedUrl(entry.path, altLocale), origin).toString();
        lines.push(`    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${escapeXml(altUrl)}"/>`);
      }
      // x-default points at the LV (defaultLocale) version.
      const defaultUrl = new URL(getLocalizedUrl(entry.path, 'lv'), origin).toString();
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultUrl)}"/>`);
      lines.push('  </url>');
    }
  }

  lines.push('</urlset>');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });
};
