'use client';

import { HackingProgram } from '@/types';
import { useStore } from '@/store/useStore';
import { useLocalized, useT } from '@/i18n';
import { findGlossaryEntry } from '@/lib/glossary';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { formatCardText } from '@/lib/formatCardText';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CodeRainCanvas } from '@/components/effects/CodeRainCanvas';
import { GlitchCanvas } from '@/components/effects/GlitchCanvas';
import { SKILL_ICON } from '@/lib/constants/skills';
import { RangeArrows, programRangeToSegments } from '@/components/shared/RangeArrows';
import { useAutoNameSize, useAutoFontSize } from '@/hooks/useAutoFontSize';

const RELOAD_KEY: Record<string, string> = {
    Inspire:  'program.reloadInspire',
    TakenOut: 'program.reloadTakenOut',
    Wounded:  'program.reloadWounded',
    Discard:  'program.reloadDiscard',
    Manual:   'program.reloadManual',
};

/* ── Sidebar stat layout tuning ─────────────────────────────────── */
const SIDEBAR_EB_LINE     = 'font-mono-tech text-[11px] text-black font-black tracking-wider'; // "EB N" same as CharacterCard
const SIDEBAR_RAR_SIZE    = 'text-[10px]'; // Rarity label
const SIDEBAR_SC_STAR     = 'text-xs';     // ★ icon size
const SIDEBAR_SC_NUM      = 'text-sm';     // Street cred number

/** Trim leading spaces per line, colorize RED/YELLOW/GREEN, link glossary terms */
function formatProgramText(text: string): React.ReactNode[] {
    return formatCardText(text, 0, { normalizeMultiline: true });
}

interface ProgramCardProps {
    program: HackingProgram;
    side: 'front' | 'back';
    enableCodeRain?: boolean;
    isFlipped?: boolean;
}

export function ProgramCard({ program, side, enableCodeRain, isFlipped }: ProgramCardProps) {
    const { catalog } = useStore();
    const loc = useLocalized();
    const t = useT();
    const programName = loc(program as unknown as Record<string, unknown>, 'name');
    const { nameRef, nameSize } = useAutoNameSize(programName);

    const factionName = program.factionId === 'all'
        ? 'Universal'
        : catalog.factions.find(f => f.id === program.factionId)?.name ?? 'Unknown';

    const reloadKey = RELOAD_KEY[program.reloadCondition];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reloadText = reloadKey ? t(reloadKey as any) : '';

    const { cardRef, textRef, fontSize } = useAutoFontSize([program.id, side], { base: 16, min: 10 });

    // Quality → sidebar gradient (white top → color bottom)
    const sidebarColor = program.quality === 'Red'
        ? '#dc2626'
        : program.quality === 'Yellow'
            ? '#eab308'
            : '#22c55e';

    const sidebarGradient = `linear-gradient(to bottom, ${sidebarColor} 40%, #ffffff)`;
    const cyanGradient = `linear-gradient(to bottom, #22d3ee 40%, #ffffff)`;

    // Compose back effect text
    const runningEffect = loc(program as unknown as Record<string, unknown>, 'runningEffect');
    const backParts: string[] = [];
    if (program.vulnerable) backParts.push('Vulnerable.');
    if (runningEffect) backParts.push(runningEffect);
    if (reloadText) backParts.push(reloadText);

    // === FRONT CARD ===
    if (side === 'front') {
        return (
            <div ref={cardRef} className="relative w-full aspect-[2.5/3.5] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md">
                {/* z-0: Full-bleed artwork (with glitch when code rain enabled) */}
                {enableCodeRain && !isFlipped ? (
                    <GlitchCanvas imageUrl={program.imageUrl} alt={program.name} className="absolute inset-0 w-full h-full z-0" damage={0.2} />
                ) : (
                    <img src={program.imageUrl} alt={program.name} className="absolute inset-0 w-full h-full object-cover z-0" />
                )}

                {/* Code rain overlay (front = passive, only when visible) */}
                {enableCodeRain && !isFlipped && (
                    <CodeRainCanvas className="absolute inset-0 w-full h-full z-0" isActive={false} quality={program.quality} side="front" />
                )}

                {/* Scanline overlay */}
                <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

                {/* LEFT SIDEBAR — Quality color gradient */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-end py-2"
                    style={{ background: sidebarGradient }}
                >
                    {/* Vertical name — above stats, mb-2 matches CharacterCard */}
                    <div
                        className="mt-auto flex flex-col items-start mb-2"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 0.9, gap: 0 }}
                    >
                        <span ref={nameRef} className="mr-[-2px] font-display text-xl uppercase tracking-normal text-black [-webkit-text-stroke:0.5px_rgba(255,255,255,0.6)]" style={{ fontWeight: 900, fontSize: `${nameSize}px` }}>
                            {programName}
                        </span>
                        <span className="mr-[-4px] font-mono-tech text-[12px] text-black/80 uppercase tracking-wide [-webkit-text-stroke:0.5px_rgba(255,255,255,0.5)]" style={{ fontWeight: 900 }}>
                            {factionName}
                        </span>
                    </div>

                    {/* Stats — EB + cost on one line, then rarity, street cred */}
                    <div className="flex flex-col items-center gap-px pb-1">
                        <span className={SIDEBAR_EB_LINE}>EB {program.costEB}</span>
                        {program.rarity < 99 && (
                            <div className={`font-mono-tech ${SIDEBAR_RAR_SIZE} text-black/60 font-bold`}>Rar.{program.rarity}</div>
                        )}
                        {program.reqStreetCred > 0 && (
                            <div className="text-black flex items-center gap-0.5">
                                <span className={SIDEBAR_SC_STAR}>★</span>
                                <span className={`font-display font-black ${SIDEBAR_SC_NUM} leading-none`}>{program.reqStreetCred}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* TOP GAUGE BAR — only if there's a tech test or a range to show */}
                {(program.techTest || program.range !== 'Self') && (
                    <div className="absolute top-0 left-[14%] right-0 z-20 bg-black/60 backdrop-blur-sm px-[3%] py-[2%] flex items-center gap-[2%]">
                        {/* Purple Hexagon — Tech Test */}
                        {program.techTest && (
                            <img
                                src={SKILL_ICON.Tech}
                                alt="Tech"
                                className="w-[18%] object-contain shrink-0"
                            />
                        )}
                        {/* Range Arrows — interlocking chevrons */}
                        {program.range !== 'Self' && (
                            <RangeArrows {...programRangeToSegments(program.range)} className="w-[65%] h-auto" />
                        )}
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
                            {(() => {
                                const flavorText = loc(program as unknown as Record<string, unknown>, 'flavorText');
                                const loadedText = loc(program as unknown as Record<string, unknown>, 'loadedText');
                                return (
                                    <>
                                        {flavorText && (
                                            <span className="italic text-white/70">&ldquo;{flavorText}&rdquo;</span>
                                        )}
                                        {flavorText && loadedText && <br />}
                                        {formatProgramText(loadedText)}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // === BACK CARD ===
    return (
        <div ref={cardRef} className="relative w-full aspect-[2.5/3.5] bg-black text-white font-sans overflow-hidden shadow-2xl rounded-md">
            {/* z-0: Full-bleed artwork (with intense glitch when code rain enabled) */}
            {enableCodeRain && isFlipped ? (
                <GlitchCanvas imageUrl={program.imageUrl} alt={program.name} className="absolute inset-0 w-full h-full z-0" damage={0.85} />
            ) : (
                <img src={program.imageUrl} alt={program.name} className="absolute inset-0 w-full h-full object-cover z-0" />
            )}

            {/* Code rain overlay (back = active/intense, only when visible) */}
            {enableCodeRain && isFlipped && (
                <CodeRainCanvas className="absolute inset-0 w-full h-full z-0" isActive={true} quality={program.quality} side="back" />
            )}

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

            {/* RIGHT SIDEBAR — Cyan gradient */}
            <div
                className="absolute right-0 top-0 bottom-0 w-[14%] z-10 flex flex-col items-center justify-end py-2 text-black"
                style={{ background: cyanGradient }}
            >
                {/* Vertical name — above stats, mb-2 matches CharacterCard */}
                <div
                    className="mt-auto flex flex-col items-start mb-2"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 0.9, gap: 0 }}
                >
                    <span ref={nameRef} className="mr-[-2px] font-display text-xl uppercase tracking-normal text-black [-webkit-text-stroke:0.5px_rgba(255,255,255,0.6)]" style={{ fontWeight: 900, fontSize: `${nameSize}px` }}>
                        {programName}
                    </span>
                    <span className="mr-[-4px] font-mono-tech text-[12px] text-black/80 uppercase tracking-wide [-webkit-text-stroke:0.5px_rgba(255,255,255,0.5)]" style={{ fontWeight: 900 }}>
                        {factionName}
                    </span>
                </div>

                {/* Stats — EB + cost on one line, then rarity, street cred */}
                <div className="flex flex-col items-center gap-px pb-1">
                    <span className={SIDEBAR_EB_LINE}>EB {program.costEB}</span>
                    {program.rarity < 99 && (
                        <div className={`font-mono-tech ${SIDEBAR_RAR_SIZE} text-black/60 font-bold`}>Rar.{program.rarity}</div>
                    )}
                    {program.reqStreetCred > 0 && (
                        <div className="text-black flex items-center gap-0.5">
                            <span className={SIDEBAR_SC_STAR}>★</span>
                            <span className={`font-display font-black ${SIDEBAR_SC_NUM} leading-none`}>{program.reqStreetCred}</span>
                        </div>
                    )}
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
                            return <React.Fragment key={i}>{formatProgramText(part)}{i < backParts.length - 1 ? ' ' : ''}</React.Fragment>;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
