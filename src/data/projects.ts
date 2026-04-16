import kuma from "@/assets/project-kuma.jpg";
import pulse from "@/assets/project-pulse.jpg";
import loom from "@/assets/project-loom.jpg";
import brew from "@/assets/project-brew.jpg";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  cover: string;
  accent: string; // hex / oklch background swatch for hero
  role: string;
  timeline: string;
  team: string;
  tools: string[];
  overview: string;
  problem: string;
  solution: string;
  outcome: { label: string; value: string }[];
  sections: { heading: string; body: string }[];
  gallery: string[];
};

export const projects: Project[] = [
  {
    slug: "kuma-books",
    title: "Kuma Books",
    tagline: "A cozy mobile library for every kind of reader.",
    category: "Mobile · iOS",
    year: "2024",
    cover: kuma,
    accent: "oklch(0.92 0.06 45)",
    role: "Lead Product Designer",
    timeline: "12 weeks",
    team: "1 PM · 2 Engineers · 1 Designer",
    tools: ["Figma", "Principle", "Notion"],
    overview:
      "Kuma is a personal reading companion that helps people track, discover and revisit the books they love — without the social pressure of Goodreads.",
    problem:
      "Casual readers told us existing apps felt like spreadsheets. They wanted warmth, not metrics, and a private space that nudges them back to reading.",
    solution:
      "We designed a calm, illustrated home that surfaces what you’re currently reading, daily reading streaks and gentle suggestions based on mood instead of genre.",
    outcome: [
      { label: "Daily active users", value: "+38%" },
      { label: "Avg. session", value: "6m 24s" },
      { label: "App Store rating", value: "4.8" },
    ],
    sections: [
      {
        heading: "Research",
        body: "We interviewed 14 readers across 3 countries. The recurring theme: reading should feel like a quiet evening in, not a leaderboard. Empathy maps and journey diagrams pointed us to three high-impact moments — picking up the book, finishing a chapter, putting it down.",
      },
      {
        heading: "Design Principles",
        body: "Warmth over data. Recognition over recall. Progress without pressure. These three principles guided every screen, from the soft serif headlines down to the rounded tab bar.",
      },
      {
        heading: "Visual System",
        body: "A custom palette of cream, terracotta and ink anchors the app, while a Fraunces / Inter pairing carries the editorial tone. Micro-illustrations celebrate small wins — finishing a chapter blooms a tiny flower in your library.",
      },
    ],
    gallery: [kuma, kuma, kuma],
  },
  {
    slug: "pulse-analytics",
    title: "Pulse Analytics",
    tagline: "Making complex SaaS data feel calm and conversational.",
    category: "Web App · B2B",
    year: "2024",
    cover: pulse,
    accent: "oklch(0.92 0.05 130)",
    role: "Senior Product Designer",
    timeline: "5 months",
    team: "2 PMs · 6 Engineers · 2 Designers",
    tools: ["Figma", "FigJam", "Linear"],
    overview:
      "Pulse helps customer success teams understand product engagement at a glance. The redesign cut time-to-insight from 8 minutes to under 1.",
    problem:
      "Power users loved the depth, but new CS managers were drowning. Dashboards required SQL-like thinking just to answer ‘who is at risk this week?’",
    solution:
      "We introduced a question-led home, plain-language insights and an opinionated default view. Advanced controls live one click away, never in the way.",
    outcome: [
      { label: "Time to first insight", value: "−87%" },
      { label: "Weekly active CS", value: "+62%" },
      { label: "Onboarding NPS", value: "71" },
    ],
    sections: [
      {
        heading: "Audit",
        body: "We mapped 84 screens and found 11 different chart styles. Consolidating to 4 made the product feel half its size — without losing a single feature.",
      },
      {
        heading: "Information Architecture",
        body: "A new three-tier navigation — Today, Accounts, Explore — replaced a 22-item sidebar. Every screen now answers a single question first, then invites you to dig deeper.",
      },
      {
        heading: "Outcome",
        body: "Beta customers reported the app ‘finally feels like it’s on their team’. The sage / cream palette and human copy turned a serious tool into a daily companion.",
      },
    ],
    gallery: [pulse, pulse, pulse],
  },
  {
    slug: "loom-shop",
    title: "Loom Shop",
    tagline: "An e-commerce experience that feels like a boutique visit.",
    category: "Mobile · Commerce",
    year: "2023",
    cover: loom,
    accent: "oklch(0.9 0.07 50)",
    role: "Product Designer",
    timeline: "9 weeks",
    team: "1 PM · 3 Engineers · 1 Designer",
    tools: ["Figma", "ProtoPie"],
    overview:
      "A direct-to-consumer fashion brand wanted their app to feel as considered as their atelier. We rebuilt browse, fit and checkout from scratch.",
    problem:
      "Conversion on mobile was 40% lower than desktop. Users abandoned at sizing — there was no confidence the garment would fit.",
    solution:
      "We built a fit profile that learns from past purchases, paired with editorial product stories and a single-screen checkout.",
    outcome: [
      { label: "Mobile conversion", value: "+34%" },
      { label: "Returns", value: "−18%" },
      { label: "Avg. order value", value: "+12%" },
    ],
    sections: [
      {
        heading: "Discovery",
        body: "Shadowing 8 customers in their homes revealed how much trust matters. Photos alone weren’t enough — they needed context, materials, and a sense of how things drape.",
      },
      {
        heading: "Editorial Commerce",
        body: "Each product page reads like a small magazine spread, with a sticky add-to-cart that never overstays its welcome.",
      },
      {
        heading: "Fit, Solved",
        body: "A three-question fit profile and previous-purchase memory gave shoppers confidence to commit, dramatically reducing returns.",
      },
    ],
    gallery: [loom, loom, loom],
  },
  {
    slug: "brew-co",
    title: "Brew Co.",
    tagline: "Branding a neighborhood coffee shop into a small ritual.",
    category: "Branding · Identity",
    year: "2023",
    cover: brew,
    accent: "oklch(0.88 0.04 70)",
    role: "Brand & Product Designer",
    timeline: "6 weeks",
    team: "Solo",
    tools: ["Figma", "Illustrator", "Photography"],
    overview:
      "A full identity system for a single-location café, from cups and bags to the order-ahead web app.",
    problem:
      "The owners had a lovely space and great coffee — but a logo from a friend, mismatched signage, and no easy way to order ahead.",
    solution:
      "A warm, hand-drawn wordmark, a tight earthy palette and a tiny PWA that lets regulars reorder ‘the usual’ in two taps.",
    outcome: [
      { label: "Repeat orders", value: "+46%" },
      { label: "Avg. wait time", value: "−3 min" },
      { label: "New regulars / mo", value: "120" },
    ],
    sections: [
      {
        heading: "Identity",
        body: "We started with the cup. A logo that survives steam, sleeve and saucer became the constraint that shaped the whole system.",
      },
      {
        heading: "Touchpoints",
        body: "From bean bags to loyalty cards, every surface uses the same warm cream and a single coral accent — instantly recognizable from across the street.",
      },
      {
        heading: "Order-ahead PWA",
        body: "A lightweight web app remembers your favorite drink and lets you skip the line. No app install, no friction.",
      },
    ],
    gallery: [brew, brew, brew],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
