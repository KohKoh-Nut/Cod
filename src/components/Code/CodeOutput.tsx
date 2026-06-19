"use client";
import { useRef, useEffect, useState, KeyboardEvent } from "react";
import type { TerminalLine } from "@/hooks/useCodeExecution";

interface CodeOutputProps {
    lines: TerminalLine[];
    isLoading: boolean;
    waitingForInput: boolean;
    onSubmitInput: (value: string) => void;
}

export default function CodeOutput({
    lines,
    isLoading,
    waitingForInput,
    onSubmitInput,
}: CodeOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState<string>("");

    // Auto-scroll to bottom on new lines
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    // Focus input whenever terminal is waiting
    useEffect(() => {
        if (waitingForInput) inputRef.current?.focus();
    }, [waitingForInput]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmitInput(draft);
            setDraft("");
        }
    };

    const lineColor: Record<TerminalLine["type"], string> = {
        output: "text-fossil-bone",
        error: "text-red-400",
        input: "text-amber-300",
        info: "text-comment italic",
    };

    const isEmpty = lines.length === 0 && !isLoading;

    return (
        <div className="font-mono text-xs w-full h-full flex flex-col overflow-hidden bg-burnt-charcoal text-fossil-bone">
            {/* Header */}
            <div className="font-bold text-xs uppercase tracking-wider w-full px-4 py-2 pt-3 flex items-center justify-between bg-canyon-floor border-b border-crushed-clay">
                <span>Console Output</span>
                {isLoading && (
                    <span className="text-warning animate-pulse normal-case tracking-normal font-normal">
                        running…
                    </span>
                )}
                {waitingForInput && !isLoading && (
                    <span className="text-amber-300 normal-case tracking-normal font-normal">
                        waiting for input…
                    </span>
                )}
            </div>

            {/* Output lines */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 leading-relaxed space-y-0.5"
            >
                {isEmpty ? (
                    <span className="text-comment italic">
                        Click &quot;run&quot; to see results here…
                    </span>
                ) : (
                    lines.map((line, i) => (
                        <div
                            key={i}
                            className={`whitespace-pre-wrap text-sm ${lineColor[line.type]}`}
                        >
                            {line.type === "input"
                                ? `> ${line.text}`
                                : line.text}
                        </div>
                    ))
                )}

                {/* Inline input row — appears at bottom when waiting */}
                {waitingForInput && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-amber-300 select-none">&gt;</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none caret-amber-300 text-amber-300 text-sm"
                            placeholder="type and press Enter…"
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
