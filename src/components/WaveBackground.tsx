"use client";

import { useEffect, useRef } from "react";

export default function WaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        // Particle wave configuration
        const cols = 80;
        const rows = 30;
        const particleSize = 2;
        const waveHeight = 40;
        const waveSpeed = 0.002;
        let time = 0;

        // Create particles grid
        interface Particle {
            baseX: number;
            baseY: number;
            x: number;
            y: number;
            z: number;
        }

        const particles: Particle[] = [];
        const spacing = canvas.width / cols;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                particles.push({
                    baseX: j * spacing,
                    baseY: canvas.height - 150 + (i * 8),
                    x: j * spacing,
                    y: canvas.height - 150 + (i * 8),
                    z: 0
                });
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += waveSpeed;

            // Update and draw particles
            particles.forEach((particle, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);

                // Wave calculation with multiple sine waves
                const wave1 = Math.sin(col * 0.08 + time * 2) * waveHeight;
                const wave2 = Math.sin(col * 0.05 + time * 1.5 + 1) * (waveHeight * 0.5);
                const wave3 = Math.sin(row * 0.1 + time) * (waveHeight * 0.3);

                particle.z = wave1 + wave2 + wave3;
                particle.y = particle.baseY + particle.z;

                // Calculate opacity based on position and wave
                const opacity = Math.max(0.1, Math.min(0.8, 0.3 + (particle.z / waveHeight) * 0.3 + (row / rows) * 0.3));

                // Cyan/teal color matching the brand
                const hue = 180 + (particle.z / waveHeight) * 20;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${opacity})`;
                ctx.fill();

                // Draw connections to nearby particles
                if (col < cols - 1) {
                    const nextHorizontal = particles[index + 1];
                    if (nextHorizontal) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(nextHorizontal.x, nextHorizontal.y);
                        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity * 0.3})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                if (row < rows - 1 && index + cols < particles.length) {
                    const nextVertical = particles[index + cols];
                    if (nextVertical) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(nextVertical.x, nextVertical.y);
                        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
