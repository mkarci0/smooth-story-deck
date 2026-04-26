## Amaç

Anasayfa hero'nun altında otomatik kayan disipline/uzmanlık bandını yenilemek. Mevcut "+" ikonları biraz jenerik duruyor — siteyi daha "architectural / calm software" konseptine yaklaştıracak alternatif bir ayraç ve düzen seçelim.

## Mevcut Durum

`src/routes/index.tsx` (satır 171-187): yatay kayan, `Product Design + Mobile & Web + ...` şeklinde, kırmızı `+` ayraçlı bir marquee. Tipografi `font-display`, hız sabit, dokunma yok.

## Alternatif Yönler (birini seç)

**A. Minimal nokta + büyük tipografi (önerilen)**  
"+" yerine küçük bir kırmızı disk (`•` ya da dolu daire). Tipografi büyür (3xl/4xl), spacing genişler, hız yavaşlar. Daha "manifesto" hissi verir, sitedeki büyük heading diliyle uyumlu. Hover'da kayma durur.

```text
Product Design  ●  Mobile & Web  ●  Brand Systems  ●  Design Strategy
```

**B. Slash ayraçlı küçük etiket bandı**  
"+" yerine ince `/` ayraç (muted renkte), kelimeler küçük caps + tracking-wide. Daha editorial/teknik bir his. Üstte küçük "Disciplines" eyebrow.

```text
PRODUCT DESIGN / MOBILE & WEB / BRAND SYSTEMS / DESIGN STRATEGY
```

**C. Çift sıra zıt yön marquee**  
Üst sıra sola, alt sıra sağa hareket eder; aralarda ince bir çizgi. Ayraç yok, kelimeler arası geniş boşluk. Hareketli ama daha sakin, "kinetic typography" hissi.

**D. Statik grid / chip ızgarası (marquee yerine)**  
Kayan bandı tamamen kaldır, yerine 4-6 sütunlu küçük chip ızgarası koy. Her chip: bir disiplin adı, hover'da kırmızı altçizgi. Daha sakin ve okunaklı, scroll'a saygılı. Reduced-motion kullanıcıları için doğal kazanım.

**E. Sayı + etiket sıralı kayan bant**  
`01 — Product Design   02 — Mobile & Web   03 — Brand Systems` formatı. Sayılar muted, etiketler ink. Daha "case study index" hissi.

## Tüm Yönler İçin Ortak İyileştirmeler

- **Reduced motion**: `prefers-reduced-motion` durumunda animasyonu durdur, içerik statik kalsın.
- **Hover-pause**: İmleç bandın üzerine geldiğinde kayma duraksın (okuma kolaylığı).
- **Erişilebilirlik**: `aria-hidden` kalır, ama içerik okunaklı font ağırlığında olsun. İçerik dekoratif kalmaya devam etsin.
- **Renk**: Kırmızı vurgu (`--coral`) daha az, daha kıymetli kullanılsın — tüm ayraçlarda değil, sadece seçilmiş yerlerde.

## Önerim

**A (minimal nokta + büyük tipografi) + hover-pause + reduced-motion**. Sitenin "calm software / architectural" tonuna en uygun. İstersen B veya D ile birleştirebiliriz (örn. mobilde D grid, masaüstünde A marquee).

## Karar Bekleyen

Hangi yönü uygulayalım (A / B / C / D / E)? Birden fazla yönü harmanlamak ister misin (ör. responsive olarak farklı davranış)? Disiplin listesi aynı mı kalsın yoksa güncelleyelim mi?
