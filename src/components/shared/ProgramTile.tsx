'use client';

import { HackingProgram } from '@/types';

export const QUALITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Green: { bg: 'bg-cyber-green', text: 'text-black', border: 'border-cyber-green' },
    Yellow: { bg: 'bg-yellow-400', text: 'text-black', border: 'border-yellow-400' },
    Red: { bg: 'bg-accent', text: 'text-white', border: 'border-accent' },
};

export function ProgramTile({ program, factionName, overlay }: { program: HackingProgram; factionName: string; overlay?: React.ReactNode }) {
    const qColor = QUALITY_COLORS[program.quality];
    return (
        <div className="relative group/tile bg-surface-dark border border-border hover:border-purple-400 transition-all overflow-hidden flex">
            {program.imageUrl && (
                <img
                    src={program.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                        opacity: 0.5,
                        WebkitMaskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                        maskImage: 'linear-gradient(to top left, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)',
                    }}
                />
            )}
            <div className={`relative z-10 w-8 shrink-0 self-stretch ${qColor.bg} flex flex-col items-center justify-center py-1`}>
                <div className={`font-display font-black text-sm ${qColor.text} leading-none`}>{program.costEB}</div>
                <div className={`font-mono-tech text-[7px] ${qColor.text} opacity-70 font-bold`}>EB</div>
            </div>
            <div className="relative z-10 flex-1 px-3 py-2 flex flex-col gap-0.5">
                <h3 className="font-display font-bold text-sm uppercase leading-tight text-white group-hover/tile:text-purple-400 transition-colors">
                    {program.name}
                </h3>
                <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-mono-tech uppercase tracking-wider font-bold ${qColor.text === 'text-black' ? 'text-muted-foreground' : qColor.text}`}>
                        {program.quality}
                    </span>
                    <span className="text-[9px] font-mono-tech text-muted-foreground uppercase">{factionName}</span>
                    {program.reqStreetCred > 0 && (
                        <span className="text-[9px] font-mono-tech text-yellow-500 uppercase">SC {program.reqStreetCred}</span>
                    )}
                </div>
                <p className="font-body text-[11px] text-white/70 leading-snug line-clamp-2">{program.loadedText}</p>
            </div>
            {overlay}
        </div>
    );
}
