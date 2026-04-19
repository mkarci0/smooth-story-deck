import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /admin/login\nDisallow: /admin/preview\nDisallow: /admin/edit/\nDisallow: /admin/settings\n\nSitemap: ${origin}/sitemap.xml\n`;

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
