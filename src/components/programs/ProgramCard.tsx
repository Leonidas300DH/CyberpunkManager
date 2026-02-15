'use client';

import { HackingProgram } from '@/types';
import { useStore } from '@/store/useStore';
import { GLOSSARY_HIGHLIGHT_REGEX, REACT_TERM_REGEX, findGlossaryEntry } from '@/lib/glossary';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const RELOAD_TEXT: Record<string, string> = {
    Inspire: 'Reload when you Inspire Your Team.',
    TakenOut: 'Reload when a rival is Taken Out.',
    Wounded: 'Reload when this model is Wounded.',
    Discard: 'Single use — Discard after Running.',
    Manual: 'Use an Action Token to Reload.',
};

const COLOR_WORDS: Record<string, string> = {
    RED: '#dc2626',
    YELLOW: '#eab308',
    GREEN: '#22c55e',
};

/** Process a plain string segment to detect & wrap glossary terms */
function linkGlossaryTerms(text: string, keyBase: number): React.ReactNode[] {
    if (!GLOSSARY_HIGHLIGHT_REGEX && !REACT_TERM_REGEX) return [text];

    // Collect all matches from both regexes
    const matches: Array<{ index: number; length: number; word: string }> = [];

    if (GLOSSARY_HIGHLIGHT_REGEX) {
        const re = new RegExp(GLOSSARY_HIGHLIGHT_REGEX.source, 'gi');
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, word: m[0] });
        }
    }
    {
        const re = new RegExp(REACT_TERM_REGEX.source, 'gi');
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, word: m[0] });
        }
    }

    if (matches.length === 0) return [text];

    // Sort by position, then deduplicate overlapping matches (keep longest)
    matches.sort((a, b) => a.index - b.index || b.length - a.length);
    const deduped: typeof matches = [];
    for (const m of matches) {
        const prev = deduped[deduped.length - 1];
        if (prev && m.index < prev.index + prev.length) continue; // overlapping → skip
        deduped.push(m);
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let k = keyBase;

    for (const m of deduped) {
        if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));

        // [RE]action → look up as "[re]action"
        const lookupWord = m.word.startsWith('[') ? '[RE]action' : m.word;
        const entry = findGlossaryEntry(lookupWord);
        if (entry) {
            parts.push(
                <GlossaryTooltip key={`g${k++}`} entry={entry}>{m.word}</GlossaryTooltip>,
            );
        } else {
            parts.push(m.word);
        }
        lastIndex = m.index + m.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

/** Trim leading spaces per line, colorize RED/YELLOW/GREEN, link glossary terms */
function formatCardText(text: string): React.ReactNode[] {
    const cleaned = text
        .replace(/\|/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');

    // Pass 1: split on color words
    const afterColors: React.ReactNode[] = [];
    const colorRe = /\b(RED|YELLOW|GREEN)\b/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = colorRe.exec(cleaned)) !== null) {
        if (match.index > lastIndex) {
            afterColors.push(cleaned.slice(lastIndex, match.index));
        }
        const word = match[1];
        afterColors.push(
            <span
                key={`c${match.index}`}
                className="font-bold"
                style={{
                    color: COLOR_WORDS[word],
                    WebkitTextStroke: '0.3px rgba(255,255,255,0.4)',
                }}
            >
                {word}
            </span>,
        );
        lastIndex = colorRe.lastIndex;
    }
    if (lastIndex < cleaned.length) {
        afterColors.push(cleaned.slice(lastIndex));
    }

    // Pass 2: for each remaining string segment, detect glossary terms
    const result: React.ReactNode[] = [];
    let keyCounter = 0;
    for (const part of afterColors) {
        if (typeof part === 'string') {
            result.push(...linkGlossaryTerms(part, keyCounter));
            keyCounter += 200;
        } else {
            result.push(part);
        }
    }
    return result;
}

interface ProgramCardProps {
    program: HackingProgram;
    side: 'front' | 'back';
}

const BASE_FONT = 16;
const MIN_FONT = 10;
const BOTTOM_MARGIN = 5;  // % of card height
const MAX_BOX_PCT = 80;   // % of card height (minus margins) before shrinking font

/**
 * Let text box grow freely up to MAX_BOX_PCT of usable card height.
 * Only shrink font if text still overflows at that limit.
 */
function useAutoFontSize(deps: unknown[]) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(BASE_FONT);

    const recalc = useCallback(() => {
        const card = cardRef.current;
        const text = textRef.current;
        if (!card || !text) return;
        const cardH = card.clientHeight;
        // Usable height = card minus bottom margin (5%)
        const usableH = cardH * (1 - BOTTOM_MARGIN / 100);
        // Max text box height = 80% of usable height
        const maxH = usableH * (MAX_BOX_PCT / 100);
        // Start at base font — only shrink if text exceeds max box
        let size = BASE_FONT;
        text.style.fontSize = `${size}px`;
        while (text.scrollHeight > maxH && size > MIN_FONT) {
            size -= 0.5;
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

export function ProgramCard({ program, side }: ProgramCardProps) {
    const { catalog } = useStore();

    const factionName = program.factionId === 'all'
        ? 'All Factions'
        : catalog.factions.find(f => f.id === program.factionId)?.name ?? 'Unknown';

    const reloadText = RELOAD_TEXT[program.reloadCondition] ?? '';

    const { cardRef, textRef, fontSize } = useAutoFontSize([program.id, side]);

    // Quality → sidebar gradient (white top → color bottom)
    const sidebarColor = program.quality === 'Red'
        ? '#dc2626'
        : program.quality === 'Yellow'
            ? '#eab308'
            : '#22c55e';

    const sidebarGradient = `linear-gradient(to bottom, #ffffff, ${sidebarColor} 60%)`;
    const cyanGradient = `linear-gradient(to bottom, #ffffff, #22d3ee 60%)`;

    // Compose back effect text
    const backParts: string[] = [];
    if (program.vulnerable) backParts.push('Vulnerable.');
    if (program.runningEffect) backParts.push(program.runningEffect);
    if (reloadText) backParts.push(reloadText);

    // === FRONT CARD ===
    if (side === 'front') {
        return (
            <div ref={cardRef} className="relative w-full aspect-[2.5/3.5] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md">
                {/* z-0: Full-bleed artwork */}
                <img
                    src={program.imageUrl}
                    alt={program.name}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Scanline overlay */}
                <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

                {/* LEFT SIDEBAR — Quality color gradient (white→color) */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-between py-3"
                    style={{ background: sidebarGradient }}
                >
                    {/* Stats at top */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="text-black flex items-center gap-0.5">
                            <span className="text-lg">★</span>
                            <span className="font-display font-black text-2xl leading-none">{program.reqStreetCred}</span>
                        </div>
                        <div className="font-mono-tech text-[9px] text-black/70 font-bold">Rar.{program.rarity}</div>
                        <div className="font-mono-tech text-[10px] text-black font-black">ED {program.costEB}</div>
                    </div>

                    {/* Vertical name */}
                    <div
                        className="flex flex-col items-center gap-0 flex-1 justify-center min-h-0"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        <span className="font-display font-black text-base uppercase tracking-widest text-black drop-shadow-sm truncate max-h-[60%]" style={{ marginRight: '-2px' }}>
                            {program.name}
                        </span>
                        <span className="font-mono-tech text-[8px] text-black/50 uppercase tracking-[0.15em] font-bold truncate max-h-[30%]" style={{ marginLeft: '-2px' }}>
                            {factionName}
                        </span>
                    </div>
                </div>

                {/* TOP GAUGE BAR — only if there's a tech test or a range to show */}
                {(program.techTest || program.range !== 'Self') && (
                    <div className="absolute top-0 left-[14%] right-0 z-20 bg-black/60 backdrop-blur-sm px-[3%] py-[2%] flex items-center gap-[2%]">
                        {/* Purple Hexagon — Tech Test */}
                        {program.techTest && (
                            <img
                                src="/images/Skills Icons/tech.png"
                                alt="Tech"
                                className="w-[18%] object-contain shrink-0"
                            />
                        )}
                        {/* Range Arrows — interlocking chevrons */}
                        {program.range !== 'Self' && (() => {
                            const r = program.range;
                            const hasLong = r === 'Long' || r === 'LongOnly' || r === 'GreenLong';
                            const GREY = '#666666';
                            const OFF = 'rgba(100,100,100,0.35)';
                            const OFF_STROKE = 'rgba(255,255,255,0.3)';
                            const ON_STROKE = 'white';
                            const redFill = (r === 'LongOnly' || r === 'GreenLong') ? GREY
                                : '#dc2626';
                            const redActive = !(r === 'LongOnly' || r === 'GreenLong');
                            const yellowFill = (r === 'LongOnly' || r === 'GreenLong') ? GREY
                                : ['Yellow', 'Green', 'Long'].includes(r) ? '#eab308' : OFF;
                            const yellowActive = !((r === 'LongOnly' || r === 'GreenLong') || !['Yellow', 'Green', 'Long'].includes(r));
                            const greenFill = r === 'LongOnly' ? GREY
                                : ['Green', 'Long', 'GreenLong'].includes(r) ? '#22c55e' : OFF;
                            const greenActive = !(r === 'LongOnly') && ['Green', 'Long', 'GreenLong'].includes(r);
                            const longFill = hasLong ? '#111111' : OFF;
                            return (
                                <svg viewBox="0 0 225 22" className="w-[65%] h-auto" fill="none">
                                    <polygon points="1,1 54,1 59,11 54,21 6,21"
                                        fill={redFill} stroke={redActive ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                        opacity={redActive ? 1 : 0.5} />
                                    <polygon points="62,1 96,1 101,11 96,21 62,21 67,11"
                                        fill={yellowFill} stroke={yellowActive ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                        opacity={yellowActive ? 1 : 0.5} />
                                    <polygon points="104,1 138,1 143,11 138,21 104,21 109,11"
                                        fill={greenFill} stroke={greenActive ? ON_STROKE : OFF_STROKE} strokeWidth="1.5" strokeLinejoin="round"
                                        opacity={greenActive ? 1 : 0.5} />
                                    {hasLong && (<>
                                        <polygon points="146,1 217,1 222,11 217,21 146,21 151,11"
                                            fill={longFill} stroke={ON_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
                                        <line x1="181" y1="11" x2="187" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="184" y1="8" x2="184" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </>)}
                                </svg>
                            );
                        })()}
                    </div>
                )}

                {/* BOTTOM TEXT BOX — Loaded text only */}
                <div
                    className="absolute bottom-[5%] left-[18%] right-[3%] z-20"
                    style={{
                        maxHeight: '76%',
                        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 14px rgba(255,255,255,0.25))',
                    }}
                >
                    <div
                        className="w-full bg-black/80 backdrop-blur-sm border-[0.5px] border-white/30 p-3"
                        style={{
                            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                        }}
                    >
                        <div
                            ref={textRef}
                            className="font-mono-tech leading-snug whitespace-pre-wrap text-white/90 text-justify text-left pr-3 pb-2"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            {program.flavorText && (
                                <span className="italic text-white/70">&ldquo;{program.flavorText}&rdquo;</span>
                            )}
                            {program.flavorText && program.loadedText && <br />}
                            {formatCardText(program.loadedText)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // === BACK CARD ===
    return (
        <div ref={cardRef} className="relative w-full aspect-[2.5/3.5] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md">
            {/* z-0: Full-bleed artwork */}
            <img
                src={program.imageUrl}
                alt={program.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

            {/* RIGHT SIDEBAR — Cyan gradient (white→cyan) */}
            <div
                className="absolute right-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-between py-3 text-black"
                style={{ background: cyanGradient }}
            >
                {/* Stats at top */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="text-black flex items-center gap-0.5">
                        <span className="text-lg">★</span>
                        <span className="font-display font-black text-2xl leading-none">{program.reqStreetCred}</span>
                    </div>
                    <div className="font-mono-tech text-[9px] text-black/70 font-bold">Rar.{program.rarity}</div>
                    <div className="font-mono-tech text-[10px] text-black font-black">ED {program.costEB}</div>
                </div>

                {/* Vertical name */}
                <div
                    className="flex flex-col items-center gap-0 flex-1 justify-center min-h-0"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                    <span className="font-display font-black text-base uppercase tracking-widest drop-shadow-sm truncate max-h-[60%]" style={{ marginRight: '-2px' }}>
                        {program.name}
                    </span>
                    <span className="font-mono-tech text-[8px] text-black/50 uppercase tracking-[0.15em] font-bold truncate max-h-[30%]" style={{ marginLeft: '-2px' }}>
                        {factionName}
                    </span>
                </div>

            </div>

            {/* BOTTOM TEXT BOX — Program Effect only */}
            <div
                className="absolute bottom-[5%] left-[3%] right-[18%] z-20"
                style={{
                    maxHeight: '76%',
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 14px rgba(255,255,255,0.25))',
                }}
            >
                <div
                    className="w-full bg-black/80 backdrop-blur-sm border-[0.5px] border-white/30 p-3"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                    }}
                >
                    <div
                        ref={textRef}
                        className="font-mono-tech leading-snug whitespace-pre-wrap text-white/90 text-justify text-left pl-3 pb-2"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <span className="font-bold">Program Effect:</span>{' '}
                        {backParts.map((part, i) => {
                            if (part === 'Vulnerable.') {
                                const vulnEntry = findGlossaryEntry('vulnerable');
                                return vulnEntry ? (
                                    <React.Fragment key={i}>
                                        <GlossaryTooltip entry={vulnEntry} className="text-red-500 font-bold">
                                            Vulnerable.
                                        </GlossaryTooltip>{' '}
                                    </React.Fragment>
                                ) : (
                                    <span key={i} className="text-red-500 font-bold">Vulnerable. </span>
                                );
                            }
                            return <React.Fragment key={i}>{formatCardText(part)}{i < backParts.length - 1 ? ' ' : ''}</React.Fragment>;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
