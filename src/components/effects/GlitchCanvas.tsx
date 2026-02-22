'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';

// ══════════════════════════════════════════════
//  GLITCH CANVAS — Broken screen effect driven
//  by character damage state.
//
//  damage = 0  → occasional glitches (alive but monitored)
//  damage > 0  → significant and increasing
//  damage = 1  → red-lined (intense, rapid)
//  isKIA       → permanent old-TV static snow
//
//  To remove this feature entirely:
//  1. Delete this file
//  2. Remove enableGlitch from PlayViewSettings
//  3. Remove the GlitchCanvas import + conditional in CharacterCard
//  4. Remove the toggle in ActiveMatchView Views dropdown
// ══════════════════════════════════════════════

interface GlitchCanvasProps {
    imageUrl: string;
    alt: string;
    className?: string;
    /** 0 (healthy) to 1 (red-lined). Drives glitch frequency & intensity. */
    damage: number;
    /** Dead — permanent static snow overlay. */
    isKIA?: boolean;
    /** Increment to trigger an immediate glitch (e.g. on wound). */
    triggerGlitch?: number;
}

// ── Glitch State ──

interface GlitchSlice { y: number; h: number; off: number }
interface GlitchBlock { x: number; y: number; w: number; h: number; dx: number; dy: number }

type GlitchKind = 'slice' | 'jitter' | 'chromatic' | 'combo' | 'tint' | 'dropout' | 'noise';

interface GlitchState {
    active: boolean;
    begin: number;
    duration: number;
    nextAt: number;
    intensity: number;
    kind: GlitchKind;
    slices: GlitchSlice[];
    blocks: GlitchBlock[];
    tintColor: [number, number, number];
    dropoutChannel: number;
    noisePatches: Array<{ x: number; y: number; w: number; h: number }>;
    // Flicker (subtle, brief, after glitch)
    flickerUntil: number;
    flickerBright: boolean;
}

// KIA snow state — cached frame for old-TV feel
interface SnowState {
    lastRegenAt: number;
    cachedData: ImageData | null;
    tearY: number;
    tearOff: number;
    barY: number; // slow-moving interference bar
}

function createGlitchState(): GlitchState {
    return {
        active: false,
        begin: 0,
        duration: 0,
        nextAt: performance.now() + 3000 + Math.random() * 8000,
        intensity: 0,
        kind: 'slice',
        slices: [],
        blocks: [],
        tintColor: [0, 0, 0],
        dropoutChannel: 0,
        noisePatches: [],
        flickerUntil: 0,
        flickerBright: false,
    };
}

function createSnowState(): SnowState {
    return { lastRegenAt: 0, cachedData: null, tearY: 0, tearOff: 0, barY: 0 };
}

// ── Damage-driven scheduling ──
// damage 0   → 12-20s   (occasional, present)
// damage 0.33 → ~5-10s  (significant)
// damage 0.66 → ~2.5-5s (heavy)
// damage 1   → 1-2.5s   (red-lined barrage)

function scheduleNext(g: GlitchState, now: number, damage: number) {
    const baseMin = 12000 - damage * 11000;    // 12s → 1s
    const baseRange = 8000 - damage * 6500;    // 8s → 1.5s
    g.nextAt = now + baseMin + Math.random() * baseRange;
    // Double-glitch: 25% chance at red-lined, scaling down
    if (Math.random() < damage * 0.25) {
        g.nextAt = now + 80 + Math.random() * 250;
    }
}

function fireGlitch(g: GlitchState, now: number, damage: number) {
    g.active = true;
    g.begin = now;

    // Duration scales up with damage
    g.duration = (150 + damage * 350) + Math.random() * (250 + damage * 500);

    // Intensity: always visible, scales with damage
    // 0 damage: 0.45-0.75, 1 damage: 0.80-1.0
    g.intensity = (0.45 + damage * 0.35) + Math.random() * (0.30 - damage * 0.10);

    // Pick kind
    const r = Math.random();
    if (damage < 0.3) {
        // Low damage: visible but contained
        if (r < 0.30) g.kind = 'slice';
        else if (r < 0.50) g.kind = 'chromatic';
        else if (r < 0.70) g.kind = 'tint';
        else if (r < 0.85) g.kind = 'jitter';
        else g.kind = 'combo';
    } else if (damage < 0.7) {
        // Mid damage: everything in play
        if (r < 0.15) g.kind = 'slice';
        else if (r < 0.30) g.kind = 'chromatic';
        else if (r < 0.42) g.kind = 'tint';
        else if (r < 0.52) g.kind = 'dropout';
        else if (r < 0.62) g.kind = 'noise';
        else if (r < 0.72) g.kind = 'jitter';
        else g.kind = 'combo';
    } else {
        // Red-lined: heavy combos
        if (r < 0.08) g.kind = 'slice';
        else if (r < 0.16) g.kind = 'chromatic';
        else if (r < 0.24) g.kind = 'tint';
        else if (r < 0.34) g.kind = 'dropout';
        else if (r < 0.42) g.kind = 'noise';
        else g.kind = 'combo';
    }

    // Slice params — always present, scale with damage
    const sliceScale = 0.5 + damage * 0.8;
    g.slices = [];
    const ns = Math.max(3, Math.floor((4 + Math.random() * 6) * (0.6 + damage * 0.6)));
    for (let i = 0; i < ns; i++) {
        g.slices.push({
            y: Math.random(),
            h: (0.006 + Math.random() * 0.04) * sliceScale,
            off: (Math.random() - 0.5) * 0.15 * sliceScale * g.intensity,
        });
    }

    // Jitter blocks
    g.blocks = [];
    const nb = Math.max(2, Math.floor((3 + Math.random() * 4) * (0.5 + damage * 0.8)));
    for (let i = 0; i < nb; i++) {
        g.blocks.push({
            x: Math.random() * 0.85,
            y: Math.random() * 0.85,
            w: (0.03 + Math.random() * 0.08) * (1 + damage * 0.8),
            h: (0.015 + Math.random() * 0.04) * (1 + damage * 0.8),
            dx: (Math.random() - 0.5) * 0.10 * (0.6 + damage),
            dy: (Math.random() - 0.5) * 0.04 * (0.6 + damage),
        });
    }

    // Tint colors
    const tints: [number, number, number][] = [
        [0, 255, 80],    // toxic green
        [255, 0, 100],   // hot magenta
        [0, 200, 255],   // electric cyan
        [255, 60, 0],    // burn orange
        [180, 0, 255],   // purple corruption
        [255, 255, 0],   // signal yellow
    ];
    g.tintColor = tints[Math.floor(Math.random() * tints.length)];

    g.dropoutChannel = Math.floor(Math.random() * 3);

    // Noise patches
    g.noisePatches = [];
    const nn = Math.max(3, Math.floor((3 + Math.random() * 6) * (0.5 + damage * 0.7)));
    for (let i = 0; i < nn; i++) {
        g.noisePatches.push({
            x: Math.random() * 0.9,
            y: Math.random() * 0.9,
            w: 0.04 + Math.random() * 0.12,
            h: 0.006 + Math.random() * 0.03,
        });
    }

    // Brief flicker after glitch (25% chance, very short)
    if (Math.random() < 0.25) {
        g.flickerUntil = now + g.duration + 30 + Math.random() * 100;
        g.flickerBright = Math.random() < 0.5;
    }
}

// ── Envelope ──

function envelope(progress: number): number {
    return 1 - Math.abs(progress * 2 - 1);
}

// ── Effects ──

function glitchSlice(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, g: GlitchState) {
    for (const s of g.slices) {
        const sy = Math.round(s.y * h);
        const sh = Math.max(2, Math.round(s.h * h));
        const off = Math.round(s.off * w * fade);
        if (Math.abs(off) < 1) continue;
        try {
            const strip = ctx.getImageData(0, sy, w, sh);
            ctx.putImageData(strip, off, sy);
            ctx.fillStyle = 'rgba(0,15,8,0.5)';
            if (off > 0) ctx.fillRect(0, sy, off, sh);
            else ctx.fillRect(w + off, sy, -off, sh);
        } catch (_) { /* */ }
    }
}

function glitchJitter(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, g: GlitchState) {
    for (const b of g.blocks) {
        const bx = Math.round(b.x * w);
        const by = Math.round(b.y * h);
        const bw = Math.round(b.w * w);
        const bh = Math.round(b.h * h);
        const dx = Math.round(b.dx * w * fade);
        const dy = Math.round(b.dy * h * fade);
        try {
            const data = ctx.getImageData(bx, by, bw, bh);
            ctx.putImageData(data, bx + dx, by + dy);
        } catch (_) { /* */ }
    }
}

function glitchChromatic(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, intensity: number, damage: number) {
    const shift = Math.round((4 + damage * 12) * intensity * fade);
    if (shift < 1) return;
    try {
        const id = ctx.getImageData(0, 0, w, h);
        const src = new Uint8ClampedArray(id.data);
        const dst = id.data;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                dst[i] = src[(y * w + Math.min(w - 1, x + shift)) * 4];
                dst[i + 1] = src[i + 1];
                dst[i + 2] = src[(y * w + Math.max(0, x - shift)) * 4 + 2];
            }
        }
        ctx.putImageData(id, 0, 0);
    } catch (_) { /* */ }
}

function glitchTint(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, g: GlitchState) {
    const [r, gr, b] = g.tintColor;
    const alpha = 0.15 + fade * 0.28 * g.intensity;
    ctx.fillStyle = `rgba(${r},${gr},${b},${alpha})`;
    const bands = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bands; i++) {
        const by = Math.random() * h;
        const bh = h * (0.1 + Math.random() * 0.3);
        ctx.fillRect(0, by, w, bh);
    }
}

function glitchDropout(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, g: GlitchState) {
    try {
        const id = ctx.getImageData(0, 0, w, h);
        const dst = id.data;
        const ch = g.dropoutChannel;
        const strength = fade * g.intensity;
        const startY = Math.floor(Math.random() * h * 0.3);
        const endY = Math.min(h, startY + Math.floor(h * (0.4 + Math.random() * 0.6)));
        for (let y = startY; y < endY; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                dst[i + ch] = Math.round(dst[i + ch] * (1 - strength * 0.85));
            }
        }
        ctx.putImageData(id, 0, 0);
    } catch (_) { /* */ }
}

function glitchNoise(ctx: CanvasRenderingContext2D, w: number, h: number, fade: number, g: GlitchState) {
    try {
        for (const patch of g.noisePatches) {
            const px = Math.round(patch.x * w);
            const py = Math.round(patch.y * h);
            const pw = Math.max(4, Math.round(patch.w * w));
            const ph = Math.max(2, Math.round(patch.h * h));
            const id = ctx.getImageData(px, py, pw, ph);
            const dst = id.data;
            const noiseFade = fade * g.intensity;
            for (let i = 0; i < dst.length; i += 4) {
                const noise = (Math.random() - 0.5) * 255 * noiseFade;
                dst[i] = Math.min(255, Math.max(0, dst[i] + noise));
                dst[i + 1] = Math.min(255, Math.max(0, dst[i + 1] + noise));
                dst[i + 2] = Math.min(255, Math.max(0, dst[i + 2] + noise));
            }
            ctx.putImageData(id, px, py);
        }
    } catch (_) { /* */ }
}

// ── KIA static snow (old TV — cached frames, ~8-12 fps feel) ──

function applyStaticSnow(ctx: CanvasRenderingContext2D, w: number, h: number, timestamp: number, snow: SnowState) {
    const SNOW_FRAME_INTERVAL = 90; // ms between snow frame regeneration (~11fps)

    // Regenerate snow frame periodically (not every render frame)
    if (!snow.cachedData || snow.cachedData.width !== w || snow.cachedData.height !== h || timestamp - snow.lastRegenAt > SNOW_FRAME_INTERVAL) {
        try {
            const id = ctx.getImageData(0, 0, w, h);
            const dst = id.data;
            const coverage = 0.20; // steady 20% pixel replacement
            for (let i = 0; i < dst.length; i += 4) {
                if (Math.random() < coverage) {
                    const v = Math.floor(Math.random() * 200) + 30; // grey range, not pure black/white
                    dst[i] = v;
                    dst[i + 1] = v;
                    dst[i + 2] = v;
                    dst[i + 3] = 255;
                }
            }
            snow.cachedData = id;
            snow.lastRegenAt = timestamp;

            // Regenerate tear position every few frames
            if (Math.random() < 0.25) {
                snow.tearY = Math.floor(Math.random() * h);
                snow.tearOff = Math.floor((Math.random() - 0.5) * w * 0.12);
            }
        } catch (_) { return; }
    }

    // Draw cached snow
    if (snow.cachedData) {
        ctx.putImageData(snow.cachedData, 0, 0);
    }

    // Slow horizontal tear line (persists across frames)
    try {
        const tearH = 2;
        const tearData = ctx.getImageData(0, snow.tearY, w, tearH);
        ctx.putImageData(tearData, snow.tearOff, snow.tearY);
    } catch (_) { /* */ }

    // Slow-moving interference bar (darker horizontal band)
    snow.barY = (snow.barY + 0.3) % h;
    const barHeight = h * 0.08;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, snow.barY, w, barHeight);
}

// ── Subtle flicker (brief brightness blip after glitch) ──

function applyFlicker(ctx: CanvasRenderingContext2D, w: number, h: number, bright: boolean) {
    ctx.fillStyle = bright ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, w, h);
}

// ── Main applicator ──

function applyGlitches(ctx: CanvasRenderingContext2D, w: number, h: number, timestamp: number, g: GlitchState, damage: number, isKIA: boolean, snow: SnowState) {
    // KIA: old-TV static
    if (isKIA) {
        applyStaticSnow(ctx, w, h, timestamp, snow);
        return;
    }

    // Brief flicker after glitch
    if (timestamp < g.flickerUntil) {
        applyFlicker(ctx, w, h, g.flickerBright);
    }

    // Fire new glitch when scheduled
    if (!g.active && timestamp >= g.nextAt) fireGlitch(g, timestamp, damage);
    if (!g.active) return;

    const p = Math.min(1, (timestamp - g.begin) / g.duration);
    const fade = envelope(p);

    switch (g.kind) {
        case 'slice':
            glitchSlice(ctx, w, h, fade, g);
            break;
        case 'jitter':
            glitchJitter(ctx, w, h, fade, g);
            break;
        case 'chromatic':
            glitchChromatic(ctx, w, h, fade, g.intensity, damage);
            break;
        case 'tint':
            glitchTint(ctx, w, h, fade, g);
            break;
        case 'dropout':
            glitchDropout(ctx, w, h, fade, g);
            break;
        case 'noise':
            glitchNoise(ctx, w, h, fade, g);
            break;
        case 'combo':
            glitchSlice(ctx, w, h, fade, g);
            if (Math.random() < 0.65) glitchChromatic(ctx, w, h, fade, g.intensity, damage);
            if (Math.random() < 0.55) glitchTint(ctx, w, h, fade, g);
            if (Math.random() < 0.45) glitchDropout(ctx, w, h, fade, g);
            if (Math.random() < 0.50) glitchNoise(ctx, w, h, fade, g);
            if (Math.random() < 0.35) glitchJitter(ctx, w, h, fade, g);
            break;
    }

    if (p >= 1) {
        g.active = false;
        scheduleNext(g, timestamp, damage);
    }
}

// ══════════════════════════════════════════════
//  REACT COMPONENT
// ══════════════════════════════════════════════

export function GlitchCanvas({ imageUrl, alt, className, damage, isKIA = false, triggerGlitch = 0 }: GlitchCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const glitchRef = useRef<GlitchState>(createGlitchState());
    const snowRef = useRef<SnowState>(createSnowState());
    const rafRef = useRef<number>(0);
    const damageRef = useRef(damage);
    const kiaRef = useRef(isKIA);
    const prevTriggerRef = useRef(triggerGlitch);

    damageRef.current = damage;
    kiaRef.current = isKIA;

    // Immediate glitch on wound (triggerGlitch increment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => {
        if (triggerGlitch > prevTriggerRef.current) {
            const g = glitchRef.current;
            // Force-fire a strong combo glitch right now
            g.active = true;
            g.begin = performance.now();
            g.duration = 250 + Math.random() * 350;
            g.intensity = 0.75 + Math.random() * 0.25;
            g.kind = 'combo';
            // Generate fresh params at high intensity
            g.slices = [];
            for (let i = 0; i < 6 + Math.floor(Math.random() * 6); i++) {
                g.slices.push({
                    y: Math.random(),
                    h: 0.01 + Math.random() * 0.05,
                    off: (Math.random() - 0.5) * 0.18 * g.intensity,
                });
            }
            g.blocks = [];
            for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
                g.blocks.push({
                    x: Math.random() * 0.85, y: Math.random() * 0.85,
                    w: 0.04 + Math.random() * 0.10, h: 0.02 + Math.random() * 0.05,
                    dx: (Math.random() - 0.5) * 0.14, dy: (Math.random() - 0.5) * 0.05,
                });
            }
            const tints: [number, number, number][] = [
                [255, 0, 100], [0, 255, 80], [0, 200, 255], [255, 60, 0],
            ];
            g.tintColor = tints[Math.floor(Math.random() * tints.length)];
            g.dropoutChannel = Math.floor(Math.random() * 3);
            g.noisePatches = [];
            for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
                g.noisePatches.push({
                    x: Math.random() * 0.9, y: Math.random() * 0.9,
                    w: 0.05 + Math.random() * 0.12, h: 0.008 + Math.random() * 0.03,
                });
            }
            g.flickerUntil = performance.now() + g.duration + 60;
            g.flickerBright = Math.random() < 0.5;
        }
        prevTriggerRef.current = triggerGlitch;
    }, [triggerGlitch]);

    const render = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !img.complete || img.naturalWidth === 0) {
            rafRef.current = requestAnimationFrame(render);
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        // Draw base image (object-cover)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = w / h;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgAspect > canvasAspect) {
            sw = img.naturalHeight * canvasAspect;
            sx = (img.naturalWidth - sw) / 2;
        } else {
            sh = img.naturalWidth / canvasAspect;
            sy = (img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

        applyGlitches(ctx, w, h, timestamp, glitchRef.current, damageRef.current, kiaRef.current, snowRef.current);

        rafRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        imgRef.current = img;

        img.onload = () => {
            rafRef.current = requestAnimationFrame(render);
        };

        if (img.complete && img.naturalWidth > 0) {
            rafRef.current = requestAnimationFrame(render);
        }

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [imageUrl, render]);

    return (
        <canvas
            ref={canvasRef}
            aria-label={alt}
            className={className}
            style={{ imageRendering: 'auto' }}
        />
    );
}
