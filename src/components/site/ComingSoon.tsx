import { motion, useReducedMotion } from "framer-motion";

type Props = {
  message: string;
};

export function ComingSoon({ message }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* subtle ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 35%, oklch(0.92 0.06 45 / 0.45) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        className="relative z-10 max-w-2xl text-center"
      >
        <p className="uppercase tracking-[0.28em] text-xs text-muted-foreground mb-6">
          Murat Karcı
        </p>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight leading-[1.05]">
          Coming{" "}
          <span className="italic text-accent">soon</span>.
        </h1>

        <p className="mt-8 text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          {message}
        </p>

        <div className="mt-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          In progress
        </div>
      </motion.div>

      <p className="absolute bottom-6 text-[11px] text-muted-foreground/70">
        © {new Date().getFullYear()} Murat Karcı
      </p>
    </div>
  );
}
