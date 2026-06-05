'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function CognitiveFluxBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas setup
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Parameters
    const params = {
      particleCount: 2000,
      noiseScale: 0.0008,
      noiseOctaves: 3,
      speed: 0.4,
      trailOpacity: 0.08,
      fadeOpacity: 0.002
    };

    // Color palette matching the website
    const colors = [
      { r: 91, g: 156, b: 245 },   // Blue
      { r: 155, g: 109, b: 255 },  // Purple
      { r: 16, g: 185, b: 129 },   // Emerald
      { r: 20, g: 184, b: 166 }    // Teal
    ];

    // Particles
    let particles: Particle[] = [];

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < params.particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          life: Math.random(),
          maxLife: 0.5 + Math.random() * 0.5
        });
      }
    };
    initParticles();

    // Multi-octave noise function (simplified)
    const noise = (x: number, y: number, t: number): number => {
      let result = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;

      for (let i = 0; i < params.noiseOctaves; i++) {
        result += (
          Math.sin(x * frequency * 0.1 + t * 0.0005) *
          Math.cos(y * frequency * 0.1 + t * 0.0003) *
          amplitude
        );
        result += (
          Math.sin(x * frequency * 0.05 + y * frequency * 0.05 + t * 0.0002) *
          amplitude * 0.5
        );
        maxValue += amplitude * 1.5;
        amplitude *= 0.5;
        frequency *= 2;
      }
      return result / maxValue;
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      // Fade background
      ctx.fillStyle = 'rgba(10, 10, 12, ' + params.fadeOpacity + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Get noise value
        const n = noise(
          p.x * params.noiseScale,
          p.y * params.noiseScale,
          time
        );

        // Calculate angle from noise
        const angle = n * Math.PI * 4;

        // Update velocity
        p.vx = Math.cos(angle) * params.speed;
        p.vy = Math.sin(angle) * params.speed;

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Update life
        p.life -= 0.001;
        if (p.life <= 0) {
          p.life = p.maxLife;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Calculate speed for color selection
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const colorIndex = Math.floor((speed / params.speed) * colors.length) % colors.length;
        const color = colors[colorIndex];

        // Draw trail
        const alpha = params.trailOpacity * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.fill();
      }

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
