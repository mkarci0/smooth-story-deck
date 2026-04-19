

## Plan: Header & Footer logo yönetimi (SVG yükleme)

### Hedefler
1. Admin'deki "Site Settings" chip yapısının altına **"Header & Footer"** adında yeni bir chip ekle. Ayrı `/admin/logo` rotası ve nav sekmesi kaldırılsın — tüm logo yönetimi Site Settings chip'leri arasına insın.
2. Mevcut **6 tipografik varyant sistemi tamamen kaldırılsın** (Logo.tsx, admin.logo.tsx rotası, logo_variant kolonu).
3. Yerine **SVG yükleme alanı** gelsin: kullanıcı SVG yükler → header ve footer'da render olur.
4. Footer'a da logo render edilsin (şu an yok).
5. Sana **6 farklı stilde örnek SVG** üreteyim, sen beğendiğini admin'den yüklersin.

### Yeni veri modeli
`site_settings` tablosunda:
- `logo_variant` kolonu → **DROP**
- `logo_svg_url` kolonu → **ADD** (text, nullable)

Header ve footer aynı SVG'yi kullanır. Yüklenmemişse fallback olarak `<span>murat karcı</span>` (Satoshi bold) gösterilir.

### Admin UX akışı

`/admin/settings` içindeki chip listesine yeni bir item:

```text
[Site Status] [Home Page] [About Me] [Recommendations] [Footer] [Header & Footer]
```

"Header & Footer" chip'i seçildiğinde gösterilecek tek bir alan:
- **Logo SVG** uploader
  - Sürükle-bırak veya "Choose file" butonu
  - Sadece `.svg` kabul eder (MIME: `image/svg+xml`)
  - Yüklenen SVG'nin canlı önizlemesi: arka planı `bg-background`, çevresi border'lı bir kutu içinde, hem light hem koyu zemin üzerinde nasıl göründüğünü gösteren 2'li grid
  - "Remove" butonu → fallback wordmark'a döner
  - Hint metni: "Bu SVG hem header'da (sol üst) hem de footer'da (sol alt) kullanılır. Önerilen yükseklik: 24-32px. Tek renk currentColor önerilir."

SVG'ler `site-assets` bucket'ına `logo/<timestamp>-<filename>.svg` yoluna yüklenir (bucket zaten public).

### Component değişiklikleri

**Yeni:** `src/components/site/SiteLogo.tsx` (Logo.tsx'in yerine)
- Props: `compact?: boolean`, `className?: string`
- Settings'i fetch eder; `logo_svg_url` varsa `<img src={url} alt="Murat Karcı" className="h-7 w-auto" />` render eder
- Yoksa `<span className="font-display font-bold tracking-tight">murat karcı</span>` fallback'i

**Güncellenir:**
- `Header.tsx` → `<SiteLogo />` kullanır, `Logo` import'u kaldırılır
- `Footer.tsx` → tagline alanının üstüne `<SiteLogo className="mb-4" />` eklenir
- `admin.tsx` → nav'dan "Logo" sekmesi kaldırılır, sadece "Projects" ve "Site Settings" kalır
- `admin.settings.tsx` → CHIPS dizisine `{ id: "header_footer", label: "Header & Footer" }` eklenir, ilgili panel render edilir
- `lib/site-settings.ts` → `LogoVariant` type'ı silinir, `logo_variant` field'ı `logo_svg_url: string | null` ile değiştirilir

**Silinir:**
- `src/components/site/Logo.tsx`
- `src/routes/admin.logo.tsx`

### Migration
```sql
ALTER TABLE site_settings DROP COLUMN logo_variant;
ALTER TABLE site_settings ADD COLUMN logo_svg_url text;
```

### 6 SVG önerisi (artifact olarak iletilecek)

Tüm SVG'ler `currentColor` kullanır (header/footer renk şemasıyla otomatik uyum), 200×40 viewBox, sade ve baskıya hazır:

1. **wordmark.svg** — Satoshi-benzeri bold lowercase "murat karcı" (path olarak embed)
2. **editorial.svg** — Serif "Murat *Karcı*" italik vurgulu (Fraunces benzeri path)
3. **monogram.svg** — Çerçeveli "MK" + kırmızı (#E85A4F) nokta
4. **architectural.svg** — Mono uppercase "MURAT.KARCI" geniş tracking
5. **signature.svg** — El yazısı "murat karcı" (Caveat tarzı path)
6. **minimal.svg** — Sadece "m.k" minimal mark

Tüm SVG'ler `/mnt/documents/logos/` altına yazılır ve her biri `<lov-artifact>` olarak ayrı ayrı sunulur. Beğendiğini indirip admin'den yüklersin.

### Sıralama
1. SVG dosyalarını üret ve artifact olarak ilet (paralel)
2. Migration çalıştır (logo_variant drop, logo_svg_url add)
3. `lib/site-settings.ts` tipini güncelle
4. Yeni `SiteLogo.tsx` componenti
5. `Header.tsx` ve `Footer.tsx` güncelle
6. `admin.settings.tsx` içine "Header & Footer" chip + uploader ekle
7. `admin.tsx` nav'dan Logo sekmesini kaldır
8. Eski `Logo.tsx` ve `admin.logo.tsx` dosyalarını sil

### Notlar
- Mevcut `site-assets` bucket public olduğu için ek RLS gerekmez; sadece authenticated admin upload yapabilir (mevcut policy'ler yeterli).
- Build'i kırmamak için tüm `Logo`/`LogoVariant` import'ları aynı anda temizlenecek.
- Footer'da logo, tagline'ın üstünde küçük (h-6) render edilir; mobilde gizlenmeyecek.

