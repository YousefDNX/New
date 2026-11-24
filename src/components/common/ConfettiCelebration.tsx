import { useEffect, useRef } from "react";
import { useOptionalPrefs } from "@/lib/preferences";

export interface ConfettiBurstDetail {
  originY?: number;
  particleCount?: number;
}

export const CONFETTI_EVENT_NAME = "nexora:celebrate";

export function triggerConfettiBurst(detail?: ConfettiBurstDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ConfettiBurstDetail>(CONFETTI_EVENT_NAME, {
      detail: detail ?? {},
    }),
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vr: number;
  color: string;
  alpha: number;
  shape: "rect" | "circle";
}

const CONFETTI_COLORS = [
  "#14b8a6",
  "#22d3ee",
  "#f59e0b",
  "#a855f7",
  "#22c55e",
  "#fb7185",
  "#38bdf8",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ConfettiCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const prefs = useOptionalPrefs();

  const reduceMotion = Boolean(
    prefs?.a11y?.reduceMotion || prefs?.ecosystem?.lowBandwidth || prefersReducedMotion(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const spawnBurst = (detail?: ConfettiBurstDetail) => {
      if (reduceMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = window.innerWidth || 1024;
      const height = window.innerHeight || 768;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      const count = Math.min(90, Math.max(24, detail?.particleCount ?? 58));
      const originY = (detail?.originY ?? 0.34) * height;
      const originX = width * 0.5;

      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
        const speed = 4 + Math.random() * 8.5;
        particlesRef.current.push({
          x: originX + (Math.random() - 0.5) * 120,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 5 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.22,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
          alpha: 1,
          shape: i % 3 === 0 ? "circle" : "rect",
        });
      }

      if (rafRef.current !== null) return;

      const step = () => {
        const c = canvasRef.current;
        const ctx = c?.getContext?.("2d");
        if (!c || !ctx) {
          particlesRef.current = [];
          rafRef.current = null;
          return;
        }
        ctx.clearRect(0, 0, c.width, c.height);

        const next: Particle[] = [];
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // gravity
          p.vx *= 0.99;
          p.rotation += p.vr;
          p.alpha -= 0.011;
          if (p.alpha <= 0.02 || p.y > c.height + 40) continue;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          }
          ctx.restore();
          next.push(p);
        }

        particlesRef.current = next;
        if (next.length > 0) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          ctx.clearRect(0, 0, c.width, c.height);
          rafRef.current = null;
        }
      };

      rafRef.current = window.requestAnimationFrame(step);
    };

    const onCelebrate = (ev: Event) => {
      const custom = ev as CustomEvent<ConfettiBurstDetail>;
      spawnBurst(custom.detail);
    };

    const onAchievementUnlocked = () => {
      spawnBurst({ particleCount: 64, originY: 0.32 });
    };

    const onResize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth || 1024;
      c.height = window.innerHeight || 768;
    };

    window.addEventListener(CONFETTI_EVENT_NAME, onCelebrate);
    window.addEventListener("nexora:achievement-unlocked", onAchievementUnlocked);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener(CONFETTI_EVENT_NAME, onCelebrate);
      window.removeEventListener("nexora:achievement-unlocked", onAchievementUnlocked);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      particlesRef.current = [];
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      data-testid="confetti-celebration-canvas"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
    />
  );
}
