// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://ceomindos.com"

interface SitemapEntry {
  path: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
  /** If true, emit only RO (no /en counterpart). */
  roOnly?: boolean
  /** If true, emit only EN (no RO counterpart). */
  enOnly?: boolean
}

// Public routes. Every entry is emitted twice (RO at `path`, EN at `/en${path}`)
// with hreflang alternates unless roOnly/enOnly is set.
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/blog/rutina-razboinicului-ceo-mind-os", changefreq: "monthly", priority: "0.7", roOnly: true },
  { path: "/blog/startup-burnout-prevention", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/entrepreneur-morning-routine-guide", changefreq: "monthly", priority: "0.7" },
  { path: "/warrior", changefreq: "weekly", priority: "0.9" },
  { path: "/quiz-rutina", changefreq: "monthly", priority: "0.8" },
  { path: "/burnout-test", changefreq: "monthly", priority: "0.9", roOnly: true },
  { path: "/burnout-test-en", changefreq: "monthly", priority: "0.8", enOnly: true },
  { path: "/ebook", changefreq: "monthly", priority: "0.8" },
  { path: "/challenge-7-zile", changefreq: "monthly", priority: "0.8", roOnly: true },
  { path: "/challenge-en", changefreq: "monthly", priority: "0.7", enOnly: true },
  { path: "/mind-coach-transform", changefreq: "monthly", priority: "0.7" },
  { path: "/warrior-launch-accelerator", changefreq: "monthly", priority: "0.7" },
  { path: "/b2b", changefreq: "monthly", priority: "0.6" },
  { path: "/referral-program", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  // Excluded (auth-gated / not for crawlers): /auth, /dashboard, /settings,
  // /profile, /stack, /stack-library, /admin, and their /en counterparts.
]

type Emitted = { loc: string; hreflang: "ro" | "en" | null; alternates: { hreflang: string; href: string }[]; changefreq?: string; priority?: string }

function build(entries: SitemapEntry[]): Emitted[] {
  const out: Emitted[] = []
  for (const e of entries) {
    const roLoc = `${BASE_URL}${e.path}`
    const enLoc = `${BASE_URL}/en${e.path === "/" ? "" : e.path}`
    if (e.roOnly) {
      out.push({ loc: roLoc, hreflang: null, alternates: [], changefreq: e.changefreq, priority: e.priority })
      continue
    }
    if (e.enOnly) {
      out.push({ loc: enLoc, hreflang: null, alternates: [], changefreq: e.changefreq, priority: e.priority })
      continue
    }
    const alternates = [
      { hreflang: "ro", href: roLoc },
      { hreflang: "en", href: enLoc },
      { hreflang: "x-default", href: roLoc },
    ]
    out.push({ loc: roLoc, hreflang: "ro", alternates, changefreq: e.changefreq, priority: e.priority })
    out.push({ loc: enLoc, hreflang: "en", alternates, changefreq: e.changefreq, priority: e.priority })
  }
  return out
}

function generateSitemap(items: Emitted[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${e.loc}</loc>`,
      ...e.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`),
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  )
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

const items = build(entries)
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(items))
console.log(`sitemap.xml written (${items.length} URLs)`)
