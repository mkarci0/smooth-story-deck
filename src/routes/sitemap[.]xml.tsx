import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

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
              .select("slug, updated_at")
              .eq("published", true)
              .order("position", { ascending: true });
            projectUrls = (data ?? []).map(
              (p) =>
                `  <url>\n    <loc>${origin}/work/${p.slug}</loc>\n    <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
            );
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

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...projectUrls].join("\n")}\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
