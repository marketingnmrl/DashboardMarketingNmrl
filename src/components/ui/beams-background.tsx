"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BeamsBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 10;
    // Marketing Na Moral colors: Purple (#19069E) hue ~250, Lime (#C2DF0C) hue ~70
    const useGreen = Math.random() > 0.6; // 40% chance of green beams
    const baseHue = useGreen ? 70 : 250;
    const hueVariation = useGreen ? 20 : 30;

    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 80 + Math.random() * 120, // Wider beams
        length: height * 2.5,
        angle: angle,
        speed: 1.5 + Math.random() * 2.5, // Much faster
        opacity: 0.35 + Math.random() * 0.35, // Much more visible
        hue: baseHue + Math.random() * hueVariation,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.04 + Math.random() * 0.06, // Faster pulse
    };
}

export function BeamsBackground({
    className,
    children,
    intensity = "strong",
}: BeamsBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const MINIMUM_BEAMS = 25; // More beams

    const opacityMap = {
        subtle: 0.8,
        medium: 1,
        strong: 1.3, // Boost opacity
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = MINIMUM_BEAMS * 1.5;
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;

            const column = index % 4;
            const spacing = canvas.width / 4;

            // More green beams
            const useGreen = index % 3 === 0;
            const baseHue = useGreen ? 70 : 250;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.6;
            beam.width = 120 + Math.random() * 150; // Wider
            beam.speed = 1.5 + Math.random() * 2; // Faster
            beam.hue = baseHue + Math.random() * 30;
            beam.opacity = 0.4 + Math.random() * 0.3; // More visible
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.7 + Math.sin(beam.pulse) * 0.3) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // More saturated and brighter colors
            const saturation = beam.hue > 100 ? 90 : 85;
            const lightness = beam.hue > 100 ? 60 : 60;

            gradient.addColorStop(0, `hsla(${beam.hue}, ${saturation}%, ${lightness}%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(${beam.hue}, ${saturation}%, ${lightness}%, ${pulsingOpacity * 0.6})`
            );
            gradient.addColorStop(
                0.3,
                `hsla(${beam.hue}, ${saturation}%, ${lightness}%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.7,
                `hsla(${beam.hue}, ${saturation}%, ${lightness}%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, ${saturation}%, ${lightness}%, ${pulsingOpacity * 0.6})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, ${saturation}%, ${lightness}%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = "blur(20px)"; // Less blur for sharper beams

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ filter: "blur(8px)" }} // Much less blur
            />

            <motion.div
                className="absolute inset-0 bg-transparent"
                animate={{
                    opacity: [0.02, 0.08, 0.02],
                }}
                transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                }}
                style={{
                    backdropFilter: "blur(30px)",
                }}
            />

            {children && (
                <div className="relative z-10">
                    {children}
                </div>
            )}
        </div>
    );
}
