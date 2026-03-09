import React, { useEffect, useRef } from 'react';

const CONFIG = {
    // Rendering Config
    maxParticles: 150,                // 화면에 유지될 최대 파티클 개수

    // Particle Generation Config
    distanceToGenerate: 40,          // 이 숫자가 클수록, 꽃잎이 더 드문드문 만들어집니다

    // Particle Appearance
    minSize: 10,                      // 파티클 최소 크기
    maxSize: 30,                      // 파티클 최대 크기
    minOpacity: 0.3,                  // 최소 투명도
    maxOpacity: 0.8,                  // 최대 투명도
    glowBlur: 65,                     // 네온 빛 번짐 강도

    // Motion & Physics
    minSpeed: 0.1,                    // 떨어지는 최소 속도
    maxSpeed: 0.3,                    // 떨어지는 최대 속도
    decayMin: 0.003,                  // 꽃잎이 흐려지는 속도 최소치
    decayMax: 0.015,                  // 꽃잎이 흐려지는 속도 최대치
    angleRotationBase: 0.004,         // 꽃잎이 회전하는 속도 배율
    spreadMultiplier: 12.0,           // 옆으로 퍼지는 확산 배율
    lerpFactor: 0.12,                 // 커서 따라가는 부드러움 (낮을수록 더 실크처럼 움직임)
};

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function getRandomKCultureColor() {
    const rand = Math.random();
    if (rand < 0.45) {
        // Red tone
        return `hsl(${randomBetween(340, 355)}, 40%, 45%)`;
    } else if (rand < 0.90) {
        // Blue tone
        return `hsl(${randomBetween(215, 230)}, 40%, 45%)`;
    } else {
        // Gold tone
        return `hsl(${randomBetween(40, 55)}, 40%, 45%)`;
    }
}

class Particle {
    x: number;
    y: number;
    size: number;
    angle: number;
    speed: number;
    color: string;
    opacity: number;
    decay: number;
    life: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = randomBetween(CONFIG.minSize, CONFIG.maxSize);
        this.angle = randomBetween(0, 360);
        this.speed = randomBetween(CONFIG.minSpeed, CONFIG.maxSpeed);
        this.color = getRandomKCultureColor();
        this.opacity = randomBetween(CONFIG.minOpacity, CONFIG.maxOpacity);
        this.decay = randomBetween(CONFIG.decayMin, CONFIG.decayMax);
        this.life = 1;
    }

    update() {
        this.angle += this.speed * CONFIG.angleRotationBase;
        this.x += Math.sin(this.angle) * this.speed * CONFIG.spreadMultiplier;
        this.y += Math.cos(this.angle) * this.speed * CONFIG.spreadMultiplier;
        this.life -= this.decay;
        this.size *= 0.96;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life * this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size, 0, 0, this.size);
        ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
        ctx.closePath();

        ctx.shadowBlur = CONFIG.glowBlur;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}

export const CustomCursor: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles: Particle[] = [];
        let physicalMouse = { x: width / 2, y: height / 2 };
        let displayMouse = { x: width / 2, y: height / 2 };
        let lastPhysicalMouse = { x: width / 2, y: height / 2 };
        let isHovering = false;

        const handlePointerMove = (e: PointerEvent) => {
            lastPhysicalMouse.x = physicalMouse.x;
            lastPhysicalMouse.y = physicalMouse.y;
            physicalMouse.x = e.clientX;
            physicalMouse.y = e.clientY;
            isHovering = true;

            const dx = physicalMouse.x - lastPhysicalMouse.x;
            const dy = physicalMouse.y - lastPhysicalMouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const particlesToGenerate = Math.max(1, Math.floor(distance / CONFIG.distanceToGenerate));

            for (let i = 0; i < particlesToGenerate; i++) {
                const t = i / particlesToGenerate;
                const x = lastPhysicalMouse.x + dx * t;
                const y = lastPhysicalMouse.y + dy * t;
                particles.push(new Particle(x, y));
            }
        };

        const handlePointerLeave = () => {
            isHovering = false;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerleave', handlePointerLeave);

        const animate = () => {
            // Clear canvas entirely because it is an overlay
            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();
                p.draw(ctx);

                if (p.life <= 0 || p.size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            if (particles.length > CONFIG.maxParticles) {
                particles.splice(0, particles.length - CONFIG.maxParticles);
            }

            ctx.globalCompositeOperation = 'source-over';

            if (isHovering) {
                // Check for magnetic elements at PHYSICAL mouse
                const hoveredEl = document.elementFromPoint(physicalMouse.x, physicalMouse.y);
                const magneticEl = hoveredEl?.closest('.magnetic-target') as HTMLElement;

                if (magneticEl) {
                    const rect = magneticEl.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Pulled target position (45% pull towards center)
                    const targetX = physicalMouse.x + (centerX - physicalMouse.x) * 0.45;
                    const targetY = physicalMouse.y + (centerY - physicalMouse.y) * 0.45;

                    displayMouse.x += (targetX - displayMouse.x) * CONFIG.lerpFactor;
                    displayMouse.y += (targetY - displayMouse.y) * CONFIG.lerpFactor;

                    // Ultra-minimal premium pointer
                    ctx.beginPath();
                    ctx.arc(displayMouse.x, displayMouse.y, 18, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)'; // Dancheong Gold Border
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Active dot
                    ctx.beginPath();
                    ctx.arc(displayMouse.x, displayMouse.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(161, 45, 39, 0.9)'; // Dancheong Red (Jangdan)
                    ctx.fill();
                } else {
                    // Smooth Silk Follow
                    displayMouse.x += (physicalMouse.x - displayMouse.x) * CONFIG.lerpFactor;
                    displayMouse.y += (physicalMouse.y - displayMouse.y) * CONFIG.lerpFactor;

                    ctx.beginPath();
                    ctx.arc(displayMouse.x, displayMouse.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(245, 245, 220, 0.9)'; // Dancheong White (Oksun)
                    ctx.fill();
                }

                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(212, 175, 55, 0.2)';
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerleave', handlePointerLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
};
