import { useEffect, useRef } from 'react';
import { PortalType } from '../../types/ecosystem';

interface ShaderBackgroundProps {
  theme?: PortalType;
}

export function ShaderBackground({ theme = 'student' }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let t = 0;

    const palettes: Record<PortalType, { r: number; g: number; b: number }[]> = {
      student: [
        { r: 99, g: 102, b: 241 },   // Indigo
        { r: 168, g: 85, b: 247 },   // Purple
        { r: 236, g: 72, b: 153 },   // Pink
        { r: 14, g: 165, b: 233 }    // Sky
      ],
      parent: [
        { r: 16, g: 185, b: 129 },   // Emerald
        { r: 6, g: 182, b: 212 },    // Cyan
        { r: 59, g: 130, b: 246 },   // Blue
        { r: 20, g: 184, b: 166 }    // Teal
      ],
      ops: [
        { r: 245, g: 158, b: 11 },   // Amber
        { r: 99, g: 102, b: 241 },   // Indigo
        { r: 239, g: 68, b: 68 },    // Red
        { r: 16, g: 185, b: 129 }    // Emerald
      ],
      college: [
        { r: 139, g: 92, b: 246 },   // Violet
        { r: 217, g: 119, b: 6 },    // Gold
        { r: 59, g: 130, b: 246 },   // Blue
        { r: 16, g: 185, b: 129 }    // Emerald
      ]
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.006;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, w, h);

      const cols = palettes[theme] || palettes.student;
      cols.forEach((c, idx) => {
        const x = w * (0.5 + 0.38 * Math.sin(t * (0.8 + idx * 0.2) + idx * 1.7));
        const y = h * (0.5 + 0.35 * Math.cos(t * (0.7 + idx * 0.15) + idx * 2.1));
        const radius = Math.max(w, h) * (0.45 + 0.1 * Math.sin(t + idx));

        const grad = ctx.createRadialGradient(x, y, 10, x, y, radius);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.18)`);
        grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.06)`);
        grad.addColorStop(1, 'rgba(6, 8, 20, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      data-testid="shader-canvas"
    />
  );
}
