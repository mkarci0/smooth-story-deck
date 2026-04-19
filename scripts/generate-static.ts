/**
 * Postbuild script: writes dist/sitemap.xml and dist/robots.txt by fetching
 * published projects from Supabase. Runs after `vite build`.
 *
 * Env vars required (read from process.env or .env via Vite-loaded vars):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional: SITE_URL (defaults to https://muratkarci.design)
 */
import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const SITE_URL = process.env.SITE_URL ?? "https://muratkarci.design";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
  );

async function fetchProjects() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[generate-static] Missing Supabase env vars; skipping project URLs.");
    return [];
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase
      .from("projects")
      .select("slug, updated_at, cover_url, title")
      .eq("published", true)
      .order("position", { ascending: true });
    if (error) {
      console.warn("[generate-static] Supabase error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[generate-static] Fetch failed:", e);
    return [];
  }
}

async function main() {
  const distDir = join(process.cwd(), "dist");
  await mkdir(distDir, { recursive: true });

  const projects = await fetchProjects();

  const projectUrls = projects.map((p) => {
    const lastmod = new Date(p.updated_at).toISOString();
    const imageBlock = p.cover_url
      ? `\n    <image:image>\n      <image:loc>${escapeXml(p.cover_url)}</image:loc>\n      <image:title>${escapeXml(p.title ?? p.slug)}</image:title>\n    </image:image>`
      : "";
    return `  <url>\n    <loc>${SITE_URL}/work/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${imageBlock}\n  </url>`;
  });

  const staticUrls = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/work", priority: "0.9", changefreq: "weekly" },
    { loc: "/about", priority: "0.8", changefreq: "monthly" },
  ].map(
    (u) =>
      `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${[...staticUrls, ...projectUrls].join("\n")}\n</urlset>\n`;

  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /admin/login\nDisallow: /admin/preview\nDisallow: /admin/edit/\nDisallow: /admin/settings\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  await writeFile(join(distDir, "sitemap.xml"), sitemap, "utf-8");
  await writeFile(join(distDir, "robots.txt"), robots, "utf-8");

  console.log(`[generate-static] Wrote sitemap.xml (${projects.length} projects) and robots.txt`);
}

main().catch((e) => {
  console.error("[generate-static] Failed:", e);
  process.exit(1);
});
