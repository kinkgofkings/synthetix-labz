import { useEffect, useRef } from "react";

interface Bolt {
  x: number;
  y: number;
  life: number;
  points: Array<[number, number]>;
}

function makeBolt(x: number, y: number): Bolt {
  const points: Array<[number, number]> = [[x, y]];
  let px = x;
  let py = y;
  const segments = 7 + Math.floor(Math.random() * 5);
  for (let index = 0; index < segments; index += 1) {
    px += (Math.random() - 0.5) * 46;
    py += 10 + Math.random() * 18;
    points.push([px, py]);
  }
  return { x, y, life: 1, points };
}

export function SparkField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const bolts: Bolt[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onPointer = (event: PointerEvent) => {
      if (reduced) return;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let index = 0; index < count; index += 1) bolts.push(makeBolt(event.clientX, event.clientY));
    };

    let frame = 0;
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let index = bolts.length - 1; index >= 0; index -= 1) {
        const bolt = bolts[index];
        bolt.life -= 0.04;
        if (bolt.life <= 0) {
          bolts.splice(index, 1);
          continue;
        }
        context.beginPath();
        bolt.points.forEach(([px, py], pointIndex) => {
          if (pointIndex === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.strokeStyle = `rgba(0, 240, 255, ${bolt.life})`;
        context.lineWidth = 1.4;
        context.shadowColor = "#00f0ff";
        context.shadowBlur = 16;
        context.stroke();
      }
      frame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[45]" aria-hidden="true" />;
}
