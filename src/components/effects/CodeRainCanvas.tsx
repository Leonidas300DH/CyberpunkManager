'use client';

import { useEffect, useRef, useCallback } from 'react';

// ══════════════════════════════════════════════
//  CODE RAIN CANVAS — Terminal-style scrolling
//  code overlay for Program cards.
//
//  Transparent canvas overlay — lines of code
//  appear in the clear zone (above text box,
//  behind sidebars), scroll up, fade out.
//
//  isActive = false → moderate (card front)
//  isActive = true  → intense (card back)
//
//  Text color: white for Green/Red quality,
//  green for Yellow quality. Occasional error
//  lines in contrasting color.
//
//  To remove this feature entirely:
//  1. Delete this file
//  2. Remove enableCodeRain from PlayViewSettings
//  3. Remove CodeRainCanvas + conditional in ProgramCard
//  4. Remove the toggle in ActiveMatchView Views dropdown
// ══════════════════════════════════════════════

interface CodeRainCanvasProps {
    className?: string;
    /** When true (card flipped/active), intense mode. */
    isActive: boolean;
    /** Card quality — determines which accent color to exclude. */
    quality: 'Green' | 'Yellow' | 'Red';
    /** Card side — front shifts text right to clear left sidebar. */
    side: 'front' | 'back';
}

// ── Terminal code lines pool ──

const CODE_LINES = [
    '> INIT_SEQUENCE 0x4F2A',
    '>> loading neural_link.dll...',
    'sys.hack(target_node);',
    'if (ICE.broken) { exploit(); }',
    'NET::BREACH protocol_v2',
    'decrypt(payload, 0xFFAE);',
    '> scan --deep --subnet=local',
    '[OK] daemon.forge started',
    'TRACE: 0xDEAD -> 0xBEEF',
    '>> compiling exploit...',
    'kernel.inject(rootkit_v3);',
    '> netrun --stealth --mask',
    'AUTH_TOKEN expired. renewing...',
    'ping(darknet.node) // 12ms',
    '[WARN] firewall.detected',
    '> bypass --proto=ghost',
    'ICE_LAYER_2 >> cracking...',
    'malloc(0x200) -> 0x7FFF42',
    'socket.open(port:4444);',
    '> upload backdoor.exe',
    '[ERR] connection.timeout',
    '> retry --force --no-log',
    'chmod 777 /dev/neural',
    'exec(shellcode, &buffer);',
    'grep -r "passwd" /sys/',
    '>> daemon forked (pid:1337)',
    'AES256.decrypt(stream);',
    '> proxy.chain(3) OK',
    'if (alarm) { wipe(); exit(); }',
    '[OK] root access granted',
    'inject(mem_addr, payload);',
    '> ssh -T ghost@10.0.1.42',
    'HANDSHAKE v3... accepted',
    'tar -xzf loot.tar.gz',
    '>> extracting credentials...',
    'syslog: intrusion.masked',
    'mv exploit /tmp/.hidden/',
    'curl -s darknet://vault',
    '> nmap -sS 192.168.0.0/24',
    'openssl rand -hex 32',
    'iptables -A INPUT -j DROP',
    '>> brute(hash, wordlist);',
    'ping neural.subnet // OK',
    '[SYS] memory.leak @ 0x0042',
    '> traceroute blackwall',
    'while(true) { listen(); }',
    'base64 -d encrypted.key',
    '>> stack overflow @ 0xBEEF',
    'fork() -> child_pid:2077',
    'mount -t ghost /dev/ice',
    'cat /proc/self/maps',
    '> run daemon --bg --quiet',
    'ptr = &exploit[0x2A];',
    'SELECT * FROM net_users;',
    '[OK] ICE breached layer 3',
    'echo $NEURAL_KEY | xxd',
    '> wget darknet://drop/kit',
    'kill -9 $(pgrep firewall)',
    'try { crack(ice); } catch {}',
    'ln -s /dev/null /var/log/*',
    '>> packet.intercept(all);',
    'ROT13(payload) -> cleartext',
    '> sudo ./nightcity_hack.sh',
    'connect(proxy, SOCKS5);',
    'nc -lvp 8080 &',
    'objdump -d neural.bin',
    '[CRIT] blackwall.proximity',
    '>> for i in $(seq 255);',
    'strace -p $DAEMON_PID',
    'dd if=/dev/urandom bs=1M',
];

// ── Color helpers ──
// Normal lines: always white.
// Accent lines: pick from red/green/yellow, excluding the card's own quality color.

const ACCENT_COLORS: Record<string, { rgba: (a: number) => string; glow: string }> = {
    Red:    { rgba: (a) => `rgba(255,50,50,${a})`,  glow: '#ff3030' },
    Green:  { rgba: (a) => `rgba(0,255,65,${a})`,   glow: '#00FF41' },
    Yellow: { rgba: (a) => `rgba(234,179,8,${a})`,   glow: '#eab308' },
};

function pickAccentColor(quality: string): { rgba: (a: number) => string; glow: string } {
    const allowed = Object.keys(ACCENT_COLORS).filter(k => k !== quality);
    return ACCENT_COLORS[allowed[Math.floor(Math.random() * allowed.length)]];
}

// ── Line State ──

interface TermLine {
    text: string;
    born: number;
    isAccent: boolean;
    accentRgba?: (a: number) => string;
    accentGlow?: string;
}

interface TermState {
    lines: TermLine[];
    nextSpawn: number;
    lastUsedIdx: number;
    seeded: boolean;
}

function createTermState(): TermState {
    return { lines: [], nextSpawn: 0, lastUsedIdx: -1, seeded: false };
}

function pickLine(state: TermState): string {
    let idx: number;
    do {
        idx = Math.floor(Math.random() * CODE_LINES.length);
    } while (idx === state.lastUsedIdx && CODE_LINES.length > 1);
    state.lastUsedIdx = idx;
    return CODE_LINES[idx];
}

// ── Tuning ──
// Zone: full card height with small margins
// Front: left pad clears the 14% sidebar
// Back: left pad is minimal

const ZONE_TOP = 0.03;
const ZONE_BOTTOM = 0.97;
const LEFT_PAD_FRONT = 0.16; // clear left sidebar (14%) + gap
const LEFT_PAD_BACK = 0.04;

function spawnInterval(active: boolean): number {
    return active
        ? 100 + Math.random() * 200
        : 250 + Math.random() * 350;
}

function maxLinesCount(): number {
    return 50;
}

function maxAge(): number {
    return 12000;
}

function getBaseAlpha(active: boolean): number {
    return active ? 0.50 : 0.30;
}

const ACCENT_CHANCE = 0.12; // 12% of lines are accent-colored

// ── Component ──

export function CodeRainCanvas({ className, isActive, quality, side }: CodeRainCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const termRef = useRef<TermState>(createTermState());
    const rafRef = useRef<number>(0);
    const activeRef = useRef(isActive);
    activeRef.current = isActive;

    const render = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas) { rafRef.current = requestAnimationFrame(render); return; }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(render); return; }

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        ctx.clearRect(0, 0, w, h);

        const term = termRef.current;
        const active = activeRef.current;
        const mAge = maxAge();
        const bAlpha = getBaseAlpha(active);
        const fontSize = Math.max(7, Math.round(h * 0.026));
        const lineH = fontSize + 3;
        const leftPad = Math.round(w * (side === 'front' ? LEFT_PAD_FRONT : LEFT_PAD_BACK));
        const zoneTop = Math.round(h * ZONE_TOP);
        const zoneBottom = Math.round(h * ZONE_BOTTOM);

        // Seed initial lines so something is visible immediately
        if (!term.seeded) {
            term.seeded = true;
            const seedCount = 40;
            for (let i = 0; i < seedCount; i++) {
                const isAccent = Math.random() < ACCENT_CHANCE;
                const accent = isAccent ? pickAccentColor(quality) : undefined;
                term.lines.push({
                    text: pickLine(term),
                    born: timestamp - (seedCount - i) * (mAge * 0.12),
                    isAccent,
                    accentRgba: accent?.rgba,
                    accentGlow: accent?.glow,
                });
            }
            term.nextSpawn = timestamp + spawnInterval(active) * 0.4;
        }

        // Active mode: very subtle green-tinted overlay
        if (active) {
            ctx.fillStyle = 'rgba(0,12,0,0.10)';
            ctx.fillRect(0, 0, w, h);
        }

        // Spawn new line
        if (timestamp >= term.nextSpawn) {
            while (term.lines.length >= maxLinesCount()) {
                term.lines.shift();
            }
            const isAccent = Math.random() < ACCENT_CHANCE;
            const accent = isAccent ? pickAccentColor(quality) : undefined;
            term.lines.push({
                text: pickLine(term),
                born: timestamp,
                isAccent,
                accentRgba: accent?.rgba,
                accentGlow: accent?.glow,
            });
            term.nextSpawn = timestamp + spawnInterval(active);
        }

        // Remove expired lines
        term.lines = term.lines.filter(l => (timestamp - l.born) < mAge);

        // Draw lines — newest at bottom of zone, scroll up
        ctx.font = `${fontSize}px "Share Tech Mono", "Courier New", monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        const count = term.lines.length;
        for (let i = 0; i < count; i++) {
            const line = term.lines[i];
            const fromBottom = count - 1 - i;
            const y = zoneBottom - fromBottom * lineH;

            if (y < zoneTop || y > zoneBottom) continue;

            const age = timestamp - line.born;
            const t = age / mAge;
            const alpha = bAlpha * Math.max(0, 1 - t * t);

            if (alpha < 0.01) continue;

            if (line.isAccent && line.accentRgba) {
                ctx.fillStyle = line.accentRgba(alpha);
                ctx.shadowColor = line.accentGlow!;
            } else {
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.shadowColor = '#ffffff';
            }
            ctx.shadowBlur = active ? 2 : 1;
            ctx.fillText(line.text, leftPad, y);
        }

        // Blinking cursor on newest line
        if (count > 0) {
            const newest = term.lines[count - 1];
            const age = timestamp - newest.born;
            const cAlpha = bAlpha * Math.max(0, 1 - (age / mAge) ** 2);
            const blink = Math.floor(timestamp / 530) % 2 === 0;

            if (blink && cAlpha > 0.03) {
                const tw = ctx.measureText(newest.text).width;
                const cx = leftPad + tw + 2;
                const cy = zoneBottom;
                ctx.shadowBlur = 0;
                if (newest.isAccent && newest.accentRgba) {
                    ctx.fillStyle = newest.accentRgba(cAlpha);
                } else {
                    ctx.fillStyle = `rgba(255,255,255,${cAlpha})`;
                }
                ctx.fillRect(cx, cy - fontSize + 1, Math.max(4, fontSize * 0.4), fontSize - 1);
            }
        }

        ctx.shadowBlur = 0;
        rafRef.current = requestAnimationFrame(render);
    // quality is stable per card instance, safe to exclude
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Reset on side change so fresh lines appear
        termRef.current.seeded = false;
        termRef.current.lines = [];
        rafRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(rafRef.current);
    }, [render, isActive]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ imageRendering: 'auto', pointerEvents: 'none' }}
        />
    );
}
