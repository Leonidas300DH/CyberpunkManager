import React from 'react';
import { GLOSSARY_HIGHLIGHT_REGEX, REACT_TERM_REGEX, findGlossaryEntry } from '@/lib/glossary';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';

const COLOR_WORDS: Record<string, string> = {
    RED: '#dc2626',
    YELLOW: '#eab308',
    GREEN: '#22c55e',
};

function linkGlossaryTerms(text: string, keyBase: number): React.ReactNode[] {
    if (!GLOSSARY_HIGHLIGHT_REGEX && !REACT_TERM_REGEX) return [text];
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
    matches.sort((a, b) => a.index - b.index || b.length - a.length);
    const deduped: typeof matches = [];
    for (const m of matches) {
        const prev = deduped[deduped.length - 1];
        if (prev && m.index < prev.index + prev.length) continue;
        deduped.push(m);
    }
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let k = keyBase;
    for (const m of deduped) {
        if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
        const lookupWord = m.word.startsWith('[') ? '[RE]action' : m.word;
        const entry = findGlossaryEntry(lookupWord);
        if (entry) {
            parts.push(<GlossaryTooltip key={`g${k++}`} entry={entry}>{m.word}</GlossaryTooltip>);
        } else {
            parts.push(m.word);
        }
        lastIndex = m.index + m.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

/** Colorize RED/YELLOW/GREEN words (bold + colored), then link glossary terms */
export function formatCardText(text: string, keyBase: number = 0): React.ReactNode[] {
    const colorRe = /\b(RED|YELLOW|GREEN)\b/g;
    const afterColors: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = colorRe.exec(text)) !== null) {
        if (match.index > lastIndex) {
            afterColors.push(text.slice(lastIndex, match.index));
        }
        const word = match[1];
        afterColors.push(
            <span
                key={`clr${match.index}`}
                className="font-bold"
                style={{ color: COLOR_WORDS[word], WebkitTextStroke: '0.3px rgba(255,255,255,0.4)' }}
            >
                {word}
            </span>,
        );
        lastIndex = colorRe.lastIndex;
    }
    if (lastIndex < text.length) {
        afterColors.push(text.slice(lastIndex));
    }
    const result: React.ReactNode[] = [];
    let keyCounter = keyBase;
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
