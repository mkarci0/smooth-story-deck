import { useEffect, useState } from "react";

export function AnimatedLabel({ labels, interval = 2000 }: { labels: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (labels.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % labels.length);
    }, interval);
    return () => clearInterval(timer);
  }, [labels, interval]);

  if (!labels.length) return null;

  return (
    <div className="flex justify-center items-center my-8">
      <span className="inline-block px-6 py-3 rounded-full bg-accent/10 text-accent font-bold text-lg shadow-md animate-fade-in">
        {labels[index]}
      </span>
    </div>
  );
}
