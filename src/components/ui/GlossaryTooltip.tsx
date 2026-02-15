'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type GlossaryEntry, RULEBOOK_SOURCE } from '@/lib/glossary';

interface Props {
    entry: GlossaryEntry;
    children: React.ReactNode;
    className?: string;
}

export function GlossaryTooltip({ entry, children, className = '' }: Props) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, showBelow: false });
    const spanRef = useRef<HTMLSpanElement>(null);

    const updatePos = useCallback(() => {
        if (!spanRef.current) return;
        const rect = spanRef.current.getBoundingClientRect();
        const showBelow = rect.top < 180;
        setPos({
            top: showBelow ? rect.bottom + 6 : rect.top - 6,
            left: Math.min(Math.max(rect.left + rect.width / 2, 148), window.innerWidth - 148),
            showBelow,
        });
    }, []);

    const handleEnter = () => { updatePos(); setShow(true); };
    const handleLeave = () => setShow(false);
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        updatePos();
        setShow(s => !s);
    };

    // Close on scroll / resize
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
                ref={spanRef}
                className={`font-bold underline decoration-dotted decoration-1 underline-offset-2 cursor-help ${className}`}
                style={{ textDecorationColor: 'rgba(252, 238, 10, 0.5)' }}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onClick={handleClick}
            >
                {children}
            </span>
            {show && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] w-72 pointer-events-none"
                    style={{
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                        transform: pos.showBelow
                            ? 'translate(-50%, 0)'
                            : 'translate(-50%, -100%)',
                    }}
                >
                    <div
                        className="bg-black/95 border border-[#FCEE0A]/50 p-3 shadow-[0_0_12px_rgba(252,238,10,0.25)]"
                        style={{
                            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                        }}
                    >
                        <div className="font-display font-black text-[#FCEE0A] text-sm uppercase tracking-wider mb-1">
                            {entry.term}
                        </div>
                        <div className="font-body text-white/85 text-xs leading-relaxed">
                            {entry.definition}
                        </div>
                        {entry.page && (
                            <div className="font-mono text-white/35 mt-2 text-[10px]">
                                {RULEBOOK_SOURCE}, {entry.page}
                            </div>
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
