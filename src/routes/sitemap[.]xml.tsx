import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
  );

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const supabaseKey =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        let projectUrls: string[] = [];
        if (supabaseUrl && supabaseKey) {
          try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase
              .from("projects")
              .select("slug, updated_at, cover_url, title")
              .eq("published", true)
              .order("position", { ascending: true });
            projectUrls = (data ?? []).map((p) => {
              const lastmod = new Date(p.updated_at).toISOString();
              const imageBlock = p.cover_url
                ? `\n    <image:image>\n      <image:loc>${escapeXml(p.cover_url)}</image:loc>\n      <image:title>${escapeXml(p.title ?? p.slug)}</image:title>\n    </image:image>`
                : "";
              return `  <url>\n    <loc>${origin}/work/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${imageBlock}\n  </url>`;
            });
          } catch (e) {
            console.error("sitemap project fetch failed", e);
          }
        }

        const staticUrls = [
          { loc: "/", priority: "1.0", changefreq: "weekly" },
          { loc: "/work", priority: "0.9", changefreq: "weekly" },
          { loc: "/about", priority: "0.8", changefreq: "monthly" },
        ].map(
          (u) =>
            `  <url>\n    <loc>${origin}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${[...staticUrls, ...projectUrls].join("\n")}\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=21600",
          },
        });
      },
    },
  },
});
