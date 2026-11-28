import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LiveAudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  status: "idle" | "connecting" | "listening" | "processing" | "speaking";
  isActive: boolean;
  className?: string;
  height?: number;
}

export function LiveAudioVisualizer({
  analyserNode,
  status,
  isActive,
  className,
  height = 48,
}: LiveAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const heightVal = canvas.height;
      ctx.clearRect(0, 0, width, heightVal);

      if (!isActive || status === "idle") {
        // Draw calm resting baseline
        ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
        const barWidth = Math.max(2, width / bufferLength - 2);
        for (let i = 0; i < bufferLength; i++) {
          const x = i * (barWidth + 2);
          ctx.fillRect(x, heightVal / 2 - 1, barWidth, 2);
        }
        return;
      }

      if (analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Simulated responsive wave if no direct analyser node available
        const t = Date.now() * 0.008;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.sin(t + i * 0.3) * 40 + 60 + Math.random() * 20);
        }
      }

      const barWidth = Math.max(2, width / bufferLength - 2);
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i] ?? 10;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * (heightVal - 6));

        const isSpeaking = status === "speaking";
        const gradient = ctx.createLinearGradient(0, heightVal, 0, 0);
        if (isSpeaking) {
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.4)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.95)");
        } else {
          gradient.addColorStop(0, "rgba(45, 212, 191, 0.35)");
          gradient.addColorStop(1, "rgba(52, 211, 153, 0.95)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, heightVal - barHeight - 2, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyserNode, isActive, status]);

  return (
    <div
      data-testid="live-audio-visualizer"
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-surface/80 p-2 shadow-xs",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        width={280}
        height={height}
        className="mx-auto block w-full max-w-[320px]"
        style={{ height }}
      />
    </div>
  );
}
