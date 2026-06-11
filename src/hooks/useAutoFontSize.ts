'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/* ── Auto-shrink vertical card name to prevent 2-line wrapping ──────── */
const NAME_BASE = 20;  // text-xl = 20px
const NAME_MIN = 11;
const NAME_STEP = 0.5;

export function useAutoNameSize(name: string) {
    const ref = useRef<HTMLSpanElement>(null);
    const [size, setSize] = useState(NAME_BASE);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // In writing-mode: vertical-rl, wrapping adds width.
        // A single line width ≈ fontSize * 1.3 (with stroke/tracking).
        let s = NAME_BASE;
        el.style.fontSize = `${s}px`;
        while (el.scrollWidth > s * 1.4 && s > NAME_MIN) {
            s -= NAME_STEP;
            el.style.fontSize = `${s}px`;
        }
        setSize(s);
    }, [name]);

    return { nameRef: ref, nameSize: size };
}

interface AutoFontSizeOptions {
    base: number;
    min: number;
    /** % of card height reserved as bottom margin */
    bottomMarginPct?: number;
    /** % of usable card height the text box may fill before shrinking */
    maxBoxPct?: number;
    /** If the text box ends up under 15% of card height, bump font +1pt (WeaponCard behavior) */
    bumpWhenSmall?: boolean;
}

/**
 * Let a card text box grow freely up to maxBoxPct of usable card height.
 * Only shrink the font if text still overflows at that limit.
 */
export function useAutoFontSize(deps: unknown[], { base, min, bottomMarginPct = 5, maxBoxPct = 80, bumpWhenSmall = false }: AutoFontSizeOptions) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(base);

    const recalc = useCallback(() => {
        const card = cardRef.current;
        const text = textRef.current;
        if (!card || !text) return;
        const cardH = card.clientHeight;
        const usableH = cardH * (1 - bottomMarginPct / 100);
        const maxH = usableH * (maxBoxPct / 100);
        let size = base;
        text.style.fontSize = `${size}px`;
        while (text.scrollHeight > maxH && size > min) {
            size -= 0.5;
            text.style.fontSize = `${size}px`;
        }
        if (bumpWhenSmall && cardH > 0 && text.scrollHeight < cardH * 0.15 && size + 1 <= base) {
            size += 1;
            text.style.fontSize = `${size}px`;
        }
        setFontSize(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        recalc();
        const ro = new ResizeObserver(recalc);
        if (cardRef.current) ro.observe(cardRef.current);
        return () => ro.disconnect();
    }, [recalc]);

    return { cardRef, textRef, fontSize };
}
