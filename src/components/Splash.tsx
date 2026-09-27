import { useEffect, useRef } from "react";
import hero from "../../public/portraits/hero.jpg";
import { Logo } from "./Logo";

export function Splash({ onEnter }: { onEnter: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const draw = (time: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "rgba(0, 240, 255, 0.35)";
      context.lineWidth = 1;
      const columns = Math.ceil(canvas.width / 28);
      for (let column = 0; column < columns; column += 1) {
        const x = column * 28 + 8;
        const height = 40 + ((column * 97 + time / 18) % (canvas.height * 0.7));
        context.globalAlpha = 0.15 + (column % 5) * 0.05;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      if (!reduced && Math.floor(time / 420) % 7 === columnPulse(time)) {
        context.globalAlpha = 0.85;
        context.shadowColor = "#00f0ff";
        context.shadowBlur = 18;
        context.beginPath();
        let x = canvas.width * (0.2 + (time % 5000) / 8000);
        let y = 40;
        context.moveTo(x, y);
        for (let step = 0; step < 12; step += 1) {
          x += (Math.random() - 0.5) * 70;
          y += 28 + Math.random() * 20;
          context.lineTo(x, y);
        }
        context.stroke();
        context.shadowBlur = 0;
      }
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    if (!reduced) frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-void text-ink">
      <img
        src={hero}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_35%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col px-6">
        <div className="p-5">
          <Logo className="h-14 w-14 shadow-[0_0_32px_rgba(0,240,255,0.45)]" />
        </div>
        <div className="mb-8 mt-auto flex flex-col items-center px-6 text-center">
          <p className="text-[11px] tracking-[0.55em] text-lab">SYNTHETIX LABZ</p>
          <h1 className="mt-3 max-w-xl text-3xl font-medium tracking-[0.12em] sm:text-5xl">ENTER THE LAB</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">
            AI systems, edge PWAs, telematics, and neural media. The field is live. The door opens on your click.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="mt-8 border border-lab bg-lab/10 px-8 py-3 text-xs tracking-[0.35em] text-lab shadow-[0_0_28px_rgba(0,240,255,0.35)] hover:bg-lab hover:text-void"
          >
            CLICK TO ENTER
          </button>
        </div>
      </div>
    </div>
  );
}

function columnPulse(time: number) {
  return Math.floor(time / 900) % 7;
}
