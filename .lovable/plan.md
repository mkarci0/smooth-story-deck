
## Hedef
`admin.muratkarci.com` subdomain'ine girildiğinde otomatik `/admin/login`'e yönlendir.

## Değişiklik
**Tek dosya:** `src/main.tsx` — `createRoot(...).render(...)` çağrısından ÖNCE host kontrolü ekle:

```ts
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const path = window.location.pathname;
  if (host === "admin.muratkarci.com" && !path.startsWith("/admin")) {
    window.location.replace("/admin/login");
  }
}
```

## Davranış
- `admin.muratkarci.com` → `/admin/login`'e replace (history kirletmez)
- `admin.muratkarci.com/admin/*` → dokunmaz (sonsuz loop önlenir, mevcut admin guard'ları çalışır)
- `muratkarci.com` ve diğer hostlar → etkilenmez
- Lovable preview / Vercel preview URL'leri → etkilenmez

## Senin yapman gerekenler (kod push edildikten sonra)
1. **Vercel → Project → Settings → Domains** → `admin.muratkarci.com` ekle
2. Vercel'in verdiği CNAME kaydını domain registrar'da `admin` subdomain için ekle
3. SSL otomatik provision olur (~5-30 dk)
4. Propagation sonrası subdomain redirect devreye girer

GitHub bağlıysa kod değişikliği otomatik push olur, Vercel otomatik deploy eder.
