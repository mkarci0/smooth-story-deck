

## Plan: Faz 5 — SEO + Performans + Dayanıklılık

### Önce keşif yapacağım, sonra uygulayacağım
Önce mevcut head/loader yapılarını okuyup eksikleri çıkaracağım, sonra sırayla uygulayacağım. Aşağıda planlanan değişiklikler:

### 1. Per-route `og:image` + head metadata audit

**`work.$slug.tsx`** — zaten mevcut, ama `twitter:card` eklenecek:
- `twitter:card: summary_large_image` ekle
- `og:image:width`/`height` ekle (1600×1000 cover ratio)

**`work.index.tsx`** — audit, eksikse ekle:
- `title: "Work — Murat Karcı"`, `description`, `og:title/description`
- İlk projenin cover'ını `og:image` olarak (loader'dan)

**`about.tsx`** — audit:
- `title`, `description`, `og:title/description` doğrula
- `about_avatar_url` varsa `og:image`

**`index.tsx`** — audit:
- Site_settings'ten home hero / featured project cover'ını `og:image` olarak

### 2. Kritik font preload + Google Fonts kırpma
`__root.tsx`:
- Satoshi 700 weight için `<link rel="preload" as="font" type="font/woff2" crossorigin>` (Fontshare CDN URL)
- Google Fonts URL'inden kullanılmayan weight'leri kırp (Fraunces, IBM Plex Mono, Caveat → faz 4'te eklenmişti, hâlâ gerek var mı kontrol et; SiteLogo SVG kullandığı için artık gereksiz olabilir → kaldır)
- `<link rel="preconnect">` Fontshare ve Supabase storage için

### 3. Image loading stratejisi
- `index.tsx` hero image (eğer varsa) → `loading="eager"` + `fetchpriority="high"`
- `work.$slug.tsx` cover → `fetchpriority="high"` ekle (zaten eager)
- `ProjectGallery` → ilk 2 görsel `eager`, geri kalanı `lazy`
- `ProjectCard` → `lazy` olduğunu doğrula
- `decoding="async"` her yerde

### 4. Empty state / fallback'ler
- `work.index.tsx` → projects boşsa "No projects yet" placeholder
- `RecommendationsSection` → boşsa hiç render etme (section başlığı bile gözükmesin)
- `SiteLogo` → SVG load hatası `onError` ile fallback wordmark'a düş
- `ProjectCard` → cover_url yoksa accent renkli gradient placeholder

### 5. Sitemap & robots iyileştirmeleri
**`sitemap.xml.tsx`:**
- `xmlns:image` namespace ekle
- Her project entry'sine `<image:image><image:loc>cover_url</image:loc></image:image>`
- `<lastmod>` için `updated_at` (varsa)
- Cache header `max-age=3600` → `max-age=21600`

**`robots.txt.tsx`:**
- `Disallow: /admin/login`, `Disallow: /admin/preview`, `Disallow: /admin/edit/`
- `Sitemap:` satırı doğru mu kontrol

### 6. JSON-LD structured data
- `index.tsx` → `Person` schema (Murat Karcı, jobTitle, url, sameAs)
- `work.$slug.tsx` → zaten `CreativeWork` var, `image`/`datePublished` doğrula
- `about.tsx` → `Person` schema (daha detaylı)

### 7. 404 ve error boundary cilası
- `__root.tsx` `notFoundComponent` → site stiliyle uyumlu, Header/Footer ile sarılı, "Go home" + "Browse work" CTA
- `router.tsx` `defaultErrorComponent` → mevcut iyi durumda, sadece tipografi `font-display` ile uyumlu hale getir

### Sıralama (uygulama)
1. Keşif: `index.tsx`, `work.index.tsx`, `about.tsx`, `__root.tsx`, `sitemap[.]xml.tsx`, `robots[.]txt.tsx`, `RecommendationsSection.tsx`, `ProjectCard.tsx`, `ProjectGallery.tsx`, `SiteLogo.tsx` oku
2. `__root.tsx` — font preload + preconnect + 404 cila
3. `index.tsx`, `work.index.tsx`, `about.tsx`, `work.$slug.tsx` — head metadata + og:image + JSON-LD
4. `sitemap.xml.tsx` + `robots.txt.tsx` — image namespace + disallow
5. `ProjectGallery.tsx`, `ProjectCard.tsx`, `SiteLogo.tsx` — image loading + onError fallback
6. `RecommendationsSection.tsx`, `work.index.tsx` — empty states

### Beklenen dosya değişimi
~10 dosya edit, 0 yeni dosya, 0 migration. Build kırılması riski düşük.

### Notlar
- Google Fonts'tan Fraunces/IBM Plex Mono/Caveat'i kaldıracağım çünkü SVG logo sistemine geçtik, bu fontlar artık header'da kullanılmıyor (faz 4 artığı).
- Per-route og:image için her loader'da gerekli alanların varlığını kontrol edeceğim.
- JSON-LD `sameAs` için kullanıcının LinkedIn/X URL'leri varsa site_settings'ten çekeceğim, yoksa atlayacağım.

