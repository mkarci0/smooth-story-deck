import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/hero-demos")({
  component: HeroDemos,
});

/**
 * Demo only — 5 alternative hero layouts for /
 * Hiçbir varyant fotoğraf kullanmıyor. Mevcut tokenlar kullanıldı.
 * Karar verdikten sonra seçilen varyant src/routes/index.tsx içine taşınacak.
 */
function HeroDemos() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl page-shell pt-16 pb-10">
        <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground">
          Internal — Hero demos
        </p>
        <h1 className="font-display text-3xl md:text-4xl mt-3">
          5 hero alternatifi (fotoğrafsız)
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Aşağıda her seçenek tam genişlikte gösteriliyor. Birini seçtikten sonra
          /index.tsx içine taşıyabilirim. Mevcut anasayfa değiştirilmedi.
        </p>
      </div>

      <Variant
        label="Option 1A — Centered + designer subtitle"
        note="Hero 1 temeli. Eyebrow rozeti UX/UI vurgusu yapıyor. Alt satırda 'now / next / clients' meta şeridi."
      >
        <HeroOneA />
      </Variant>

      <Variant
        label="Option 1B — Centered + role tagline"
        note="Başlık altına 'UX/UI Designer · 8 yıl' tag çizgisi + araç chip'leri (Figma, Framer, Webflow)."
      >
        <HeroOneB />
      </Variant>

      <Variant
        label="Option 1C — Centered + 'currently designing' line"
        note="Başlığın hemen altında küçük canlı durum: 'Currently designing onboarding for X · open for Q1 2026'."
      >
        <HeroOneC />
      </Variant>

      <Variant
        label="Option 1D — Centered + impact metrics"
        note="Başlık + 3 küçük metrik kolonu (40+ shipped products · 8 yrs · 12 industries). Designer'ın izi rakamlarda."
      >
        <HeroOneD />
      </Variant>

      <Variant
        label="Option 1 — (önceki) Editorial centered"
        note="İlk gönderdiğim Option 1, referans için duruyor."
      >
        <HeroOne />
      </Variant>

      <Variant
        label="Option 2 — Oversized split with index"
        note="Sol: numaralı bölüm indeksi. Sağ: dev başlık + kısa metin. Editorial his."
      >
        <HeroTwo />
      </Variant>

      <Variant
        label="Option 3 — Manifesto block"
        note="Tek paragraf manifesto, içinde vurgu kelimeler. CTA satır altında."
      >
        <HeroThree />
      </Variant>

      <Variant
        label="Option 4 — Marquee-as-hero"
        note="Hero'nun kendisi yavaş kayan büyük tipografi. Altında kısa açıklama + CTA."
      >
        <HeroFour />
      </Variant>

      <Variant
        label="Option 5 — Status grid"
        note="Sol: başlık. Sağ: 4 küçük kutu (rol, lokasyon, durum, yıl). Bilgi yoğun ama dengeli."
      >
        <HeroFive />
      </Variant>
    </div>
  );
}

function Variant({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl page-shell pt-10 pb-4">
        <p className="uppercase tracking-[0.2em] text-[11px] text-accent font-medium">
          {label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{note}</p>
      </div>
      <div className="pb-8">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------- */
/* Option 1A — Centered + designer subtitle (now / next)    */
/* -------------------------------------------------------- */
function HeroOneA() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-foreground font-medium">UX / UI Designer</span>
          <span className="text-muted-foreground">— Istanbul, available Q1 2026</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance max-w-5xl"
        >
          I design <span className="text-accent">interfaces</span>
          <br /> people understand at a glance.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-base md:text-lg text-muted-foreground max-w-2xl text-balance leading-relaxed"
        >
          Murat Karcı — independent product designer working with founders and
          product teams on mobile, web, and brand systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">About me</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-3xl text-left"
        >
          <MetaLine label="Currently" value="Designing onboarding for a fintech app" />
          <MetaLine label="Next" value="Brand system for an AI startup" />
          <MetaLine label="Recent clients" value="HeyPungi · Nineleaps · independent" />
        </motion.div>
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3">
      <p className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-snug">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 1B — Centered + role tagline + tools chips        */
/* -------------------------------------------------------- */
function HeroOneB() {
  const tools = ["Figma", "Framer", "Webflow", "Principle", "Notion"];
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground">
          Murat Karcı · Product Designer
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance max-w-5xl"
        >
          UX & UI design for
          <br /> <span className="text-accent">products that ship.</span>
        </motion.h1>

        <p className="mt-6 inline-flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          UX / UI Designer · 8 years · Mobile, Web, Brand
          <span className="h-px w-8 bg-border" />
        </p>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
          Independent designer working with founders and product teams to ship
          calm, well-crafted interfaces.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">About me</Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
          <span className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground mr-2">
            Toolkit
          </span>
          {tools.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 1C — Centered + 'currently designing' live line   */
/* -------------------------------------------------------- */
function HeroOneC() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance max-w-5xl"
        >
          Murat Karcı —
          <br /> product &amp; <span className="text-accent">interface</span> designer.
        </motion.h1>

        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-muted/60 border border-border px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-foreground">Currently designing</span>
          <span className="text-muted-foreground">
            onboarding for a fintech app · open for Q1 2026
          </span>
        </div>

        <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
          I help founders and product teams ship calm, considered software —
          across mobile, web, and brand. Quiet interfaces, sharp details.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">About me</Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>Product Design</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span>Mobile &amp; Web</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span>Brand Systems</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span>Design Strategy</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 1D — Centered + impact metrics                    */
/* -------------------------------------------------------- */
function HeroOneD() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground">
          UX / UI · Product Designer
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance max-w-5xl"
        >
          Designing software
          <br /> people <span className="text-accent">actually use.</span>
        </motion.h1>

        <p className="mt-7 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
          Murat Karcı — independent designer partnering with founders and
          product teams from zero-to-one to scale.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">About me</Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border w-full max-w-2xl">
          <Stat number="40+" label="Products shipped" />
          <Stat number="8 yrs" label="Designing in product" />
          <Stat number="12" label="Industries served" />
        </div>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-background py-5 px-4">
      <p className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-foreground">
        {number}
      </p>
      <p className="mt-1 uppercase tracking-[0.16em] text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 1 — Editorial centered                            */
/* -------------------------------------------------------- */
function HeroOne() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Available for select projects · 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance max-w-5xl"
        >
          Calm software,
          <br />
          designed with <span className="text-accent">intent.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed"
        >
          I'm Murat — an independent product designer working with founders and
          product teams on mobile, web, and brand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">
            About me
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 2 — Oversized split with index                    */
/* -------------------------------------------------------- */
function HeroTwo() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="grid md:grid-cols-[200px_minmax(0,1fr)] gap-10 md:gap-16 items-start">
        <div className="space-y-6 md:pt-4">
          <Index n="01" label="Discipline" value="Product Design" />
          <Index n="02" label="Surfaces" value="Mobile · Web · Brand" />
          <Index n="03" label="Status" value="Open · 2026" />
        </div>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-6xl md:text-8xl lg:text-[9rem] tracking-[-0.03em] leading-[0.92] text-balance"
          >
            Designing
            <br />
            <span className="text-accent">considered</span>
            <br />
            products.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Murat Karcı — independent designer working with founders and product
            teams to ship calm, well-crafted software.
          </motion.p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/work" className="btn-primary group">
              See selected work
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/about" className="btn-secondary">
              About me
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Index({ n, label, value }: { n: string; label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm tabular-nums text-accent">{n}</span>
        <span className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-sm">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 3 — Manifesto block                               */
/* -------------------------------------------------------- */
function HeroThree() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground mb-10">
        Murat Karcı — Product Designer
      </p>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.08] text-balance max-w-5xl"
      >
        I help founders and product teams ship{" "}
        <span className="text-accent">calm, considered</span> software — across
        mobile, web, and brand. Quiet interfaces, sharp details, and{" "}
        <span className="underline decoration-accent decoration-2 underline-offset-[6px]">
          decisions that hold up
        </span>{" "}
        a year later.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-12 flex flex-wrap items-center gap-3"
      >
        <Link to="/work" className="btn-primary group">
          See selected work
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link to="/about" className="btn-secondary">
          About me
        </Link>
        <span className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Open for select projects
        </span>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 4 — Marquee-as-hero                               */
/* -------------------------------------------------------- */
function HeroFour() {
  const words = [
    "Product Design",
    "Mobile",
    "Web",
    "Brand Systems",
    "Strategy",
    "Prototyping",
  ];
  return (
    <div className="pt-12 md:pt-16 pb-20">
      <div className="mx-auto max-w-6xl page-shell">
        <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground">
          Murat Karcı · Independent Product Designer
        </p>
      </div>

      <div
        aria-hidden="true"
        className="marquee-pause mt-8 overflow-hidden border-y border-border/60 py-6 md:py-10"
      >
        <div className="flex gap-12 md:gap-16 animate-marquee whitespace-nowrap font-display text-6xl md:text-8xl lg:text-[10rem] tracking-[-0.03em] leading-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-16 shrink-0">
              {words.map((w, j) => (
                <span key={`${i}-${j}`} className="flex items-center gap-12 md:gap-16">
                  <span className={j % 3 === 1 ? "text-accent" : ""}>{w}</span>
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground/30 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl page-shell mt-10 grid md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-end">
        <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Working with founders and product teams to ship calm, well-crafted
          software. Currently open for select projects.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/work" className="btn-primary group">
            See selected work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link to="/about" className="btn-secondary">
            About me
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- */
/* Option 5 — Status grid                                   */
/* -------------------------------------------------------- */
function HeroFive() {
  return (
    <div className="mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-20">
      <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 items-end">
        <div>
          <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground">
            Welcome
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.95] text-balance"
          >
            Hi, I'm Murat.
            <br />
            <span className="text-muted-foreground">I design</span>
            <br />
            calm software.
          </motion.h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/work" className="btn-primary group">
              See selected work
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/about" className="btn-secondary">
              About me
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          <Cell label="Role" value="Product Designer" />
          <Cell label="Based in" value="Istanbul" />
          <Cell label="Status" value="Open · 2026" accent />
          <Cell label="Working on" value="Mobile · Web · Brand" />
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-background p-5 md:p-6">
      <p className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-lg md:text-xl tracking-tight ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
