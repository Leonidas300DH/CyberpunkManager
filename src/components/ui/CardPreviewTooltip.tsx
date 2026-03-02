'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CardPreviewTooltipProps {
    children: React.ReactNode;
    renderCard: () => React.ReactNode;
}

const CARD_W = 400;
const SCALE = 0.45;
const VISUAL_W = CARD_W * SCALE;   // ~180
const VISUAL_H = CARD_W * (3.5 / 2.5) * SCALE; // ~252

export function CardPreviewTooltip({ children, renderCard }: CardPreviewTooltipProps) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, showBelow: false });
    const ref = useRef<HTMLSpanElement>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updatePos = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const showBelow = rect.top < VISUAL_H + 20;
        setPos({
            top: showBelow ? rect.bottom + 8 : rect.top - 8,
            left: Math.min(Math.max(rect.left + rect.width / 2, VISUAL_W / 2 + 8), window.innerWidth - VISUAL_W / 2 - 8),
            showBelow,
        });
    }, []);

    const handleEnter = () => {
        if (window.innerWidth < 768) return;
        hoverTimer.current = setTimeout(() => {
            updatePos();
            setShow(true);
        }, 200);
    };

    const handleLeave = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setShow(false);
    };

    useEffect(() => {
        if (!show) return;
        const close = () => setShow(false);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [show]);

    return (
        <>
            <span
                ref={ref}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                {children}
            </span>
            {show && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                        transform: pos.showBelow
                            ? 'translate(-50%, 0)'
                            : 'translate(-50%, -100%)',
                        width: VISUAL_W,
                        height: VISUAL_H,
                        overflow: 'hidden',
                        borderRadius: 2,
                        boxShadow: '0 0 20px rgba(252,238,10,0.15), 0 4px 30px rgba(0,0,0,0.8)',
                    }}
                >
                    <div style={{
                        width: CARD_W,
                        transformOrigin: 'top left',
                        transform: `scale(${SCALE})`,
                    }}>
                        {renderCard()}
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
