import React, { useEffect, useRef } from 'react';

interface CosmicBreezeBackgroundProps {
  intensity?: number; // 0 to 1
}

export const CosmicBreezeBackground: React.FC<CosmicBreezeBackgroundProps> = ({
  intensity = 0.55,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initPlants();
    };

    window.addEventListener('resize', handleResize);

    // Plant stalks parameters
    interface PlantStalk {
      baseX: number;
      baseY: number;
      length: number;
      segments: number;
      color: string;
      glowColor: string;
      swaySpeed: number;
      swayAmplitude: number;
      phase: number;
      branchCount: number;
    }

    interface SporeParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      fadeSpeed: number;
    }

    let plants: PlantStalk[] = [];
    let spores: SporeParticle[] = [];

    const initPlants = () => {
      plants = [];
      const count = Math.floor(width / 75) + 10;
      for (let i = 0; i < count; i++) {
        // Distribute along bottom, with clusters at corners
        const xRatio = i / (count - 1);
        const baseX = xRatio * width + (Math.random() * 40 - 20);
        const length = 140 + Math.random() * 220;
        const colorPalette = [
          'rgba(0, 240, 255, ',   // neon cyan
          'rgba(16, 185, 129, ',  // emerald green
          'rgba(6, 182, 212, ',   // deep cyan
          'rgba(52, 211, 153, ',  // mint green
          'rgba(99, 102, 241, ',  // indigo stardust
        ];
        const selected = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        plants.push({
          baseX,
          baseY: height + 20,
          length,
          segments: 18,
          color: selected,
          glowColor: `${selected}0.35)`,
          swaySpeed: 0.0008 + Math.random() * 0.0012,
          swayAmplitude: 35 + Math.random() * 45,
          phase: Math.random() * Math.PI * 2,
          branchCount: 3 + Math.floor(Math.random() * 4),
        });
      }

      // Spores floating in breeze
      spores = [];
      for (let i = 0; i < 45; i++) {
        spores.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.15 + Math.random() * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          radius: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.4,
          fadeSpeed: 0.002 + Math.random() * 0.003,
        });
      }
    };

    initPlants();

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient overlay
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(8, 18, 38, 0.4)');
      bgGrad.addColorStop(0.6, 'rgba(3, 7, 18, 0.7)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle botanical breeze tendrils
      plants.forEach((plant) => {
        ctx.save();
        ctx.beginPath();
        let currX = plant.baseX;
        let currY = plant.baseY;
        ctx.moveTo(currX, currY);

        const segLen = plant.length / plant.segments;
        const wind =
          Math.sin(time * plant.swaySpeed + plant.phase) *
          Math.cos(time * 0.0006 + plant.baseX * 0.005);

        for (let s = 1; s <= plant.segments; s++) {
          const progress = s / plant.segments;
          const curveFactor = Math.pow(progress, 1.8);
          const swayOffset = wind * plant.swayAmplitude * curveFactor * intensity;

          // Gentle flutter
          const flutter = Math.sin(time * 0.003 + s * 0.5) * 4 * progress;

          currX = plant.baseX + swayOffset + flutter;
          currY = plant.baseY - s * segLen;

          ctx.lineTo(currX, currY);

          // Draw small leaf/frond filaments branching off
          if (s % 3 === 0 && s < plant.segments - 1) {
            const leafDir = s % 2 === 0 ? 1 : -1;
            const leafLen = 14 * (1 - progress * 0.5);
            const leafAngle = (leafDir * 0.7) + wind * 0.3;
            const leafEndX = currX + Math.cos(leafAngle) * leafLen;
            const leafEndY = currY - Math.sin(leafAngle) * leafLen * 0.6;

            ctx.moveTo(currX, currY);
            ctx.quadraticCurveTo(
              currX + leafDir * 5,
              currY - 5,
              leafEndX,
              leafEndY
            );
            ctx.moveTo(currX, currY);
          }
        }

        // Bioluminescent gradient stroke
        ctx.strokeStyle = plant.color + (0.28 * intensity) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Tip bioluminescent glow node
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = plant.color + (0.6 * intensity) + ')';
        ctx.shadowColor = plant.color + '0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.restore();
      });

      // Render floating spores drifting in the gentle breeze
      spores.forEach((spore) => {
        spore.x += spore.vx;
        spore.y += spore.vy + Math.sin(time * 0.005 + spore.x) * 0.2;
        spore.alpha += Math.sin(time * 0.01) * spore.fadeSpeed;

        if (spore.x > width) spore.x = 0;
        if (spore.y < 0) spore.y = height;

        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${Math.max(0.05, Math.min(0.4, spore.alpha))})`;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};
