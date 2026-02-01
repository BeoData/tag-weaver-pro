import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformVisualizerProps {
    peaks?: number[];
    color?: string; // Kept for backward compat, but we'll use gradient by default
    className?: string;
    height?: number;
    isLoading?: boolean;
    progress?: number;
    showScanner?: boolean;
}

export function WaveformVisualizer({
    peaks,
    color,
    className,
    height = 64,
    isLoading = false,
    progress = 0,
    showScanner = false
}: WaveformVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.offsetWidth;
        const renderHeight = height;

        // Resize canvas for high DPI
        canvas.width = width * dpr;
        canvas.height = renderHeight * dpr;
        ctx.scale(dpr, dpr);

        // Create Gradient (Orange -> Teal)
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#21c544ff'); // Orange
        gradient.addColorStop(1, '#049b9eff'); // Teal

        // Animation state
        let animationFrameId: number;
        const startTime = performance.now();

        const render = () => {
            // Clear
            ctx.clearRect(0, 0, width, renderHeight);

            // Determine data to draw
            let drawData: number[] = [];
            let isDummy = false;

            if (!peaks || peaks.length === 0) {
                isDummy = true;
                const dummyLength = 100;
                drawData = new Array(dummyLength).fill(0).map((_, i) => {
                    return 0.3 + (Math.sin(i * 0.2) * 0.2) + (Math.random() * 0.2);
                });
            } else {
                drawData = peaks;
            }

            const barWidth = width / drawData.length;
            const center = renderHeight / 2;

            // Draw bars
            for (let i = 0; i < drawData.length; i++) {
                let amplitude = drawData[i];

                if (isDummy) {
                    // Dummy waveform logic
                    amplitude = amplitude * (renderHeight / 2);
                    const x = i * barWidth;
                    const progressWidth = (progress / 100) * width;

                    if (x < progressWidth) {
                        ctx.fillStyle = gradient;
                    } else {
                        ctx.fillStyle = '#333333';
                    }
                    ctx.fillRect(x, center - amplitude, barWidth + 0.5, amplitude * 2);

                } else {
                    // Real waveform logic
                    amplitude = Math.pow(amplitude, 0.8) * (renderHeight / 2);
                    const x = i * barWidth;
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, center - amplitude, barWidth + 0.5, amplitude * 2);
                }
            }

            // --- SCANNER EFFECT ---
            if (isLoading && showScanner) {
                const time = performance.now() - startTime;
                // Scanner speed: 4 seconds per cycle
                const cycleDuration = 4000;
                const cycle = (time % cycleDuration) / cycleDuration;
                // const scannerX = cycle * width ;
                const pingPong = 1 - Math.abs(1 - 2 * cycle);

                const scannerX = pingPong * width;

                // Draw Scanner Line
                ctx.beginPath();
                ctx.moveTo(scannerX, 0);
                ctx.lineTo(scannerX, renderHeight);
                ctx.strokeStyle = 'rgba(13, 133, 180, 0.8)'; // White bright core
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#14B8A6'; // Teal glow
                ctx.stroke();

                // Reset shadow
                ctx.shadowBlur = 0;
            }

            if (isLoading) {
                // Request next frame for smooth animation
                animationFrameId = requestAnimationFrame(render);
            }
        };

        // Start render loop
        render();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [peaks, color, height, isLoading, progress, showScanner]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full block rounded-md bg-black/20", className)}
            style={{ height: `${height}px` }}
        />
    );
}
