"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import type { TerminalLine } from "@/hooks/useCodeExecution";

interface CodeOutputProps {
    lines: TerminalLine[];
    isLoading: boolean;
    waitingForInput: boolean;
    onSubmitInput: (value: string) => void;
}

const LINE_COLORS: Record<TerminalLine["type"], string> = {
    output: "text-fg",
    error: "text-error",
    input: "text-warning",
    info: "text-comment italic",
};

export default function CodeOutput({
    lines,
    isLoading,
    waitingForInput,
    onSubmitInput,
}: CodeOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");

    // Auto-scroll to bottom when new text lines arrive
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [lines]);

    // Focus input field when waiting for user input
    useEffect(() => {
        if (waitingForInput) {
            inputRef.current?.focus();
        }
    }, [waitingForInput]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmitInput(inputValue);
            setInputValue("");
        }
    };

    const hasNoOutput = lines.length === 0 && !isLoading;

    return (
        <div className="font-mono text-xs w-full h-full flex flex-col overflow-hidden bg-bg text-fg rounded-none">
            {/* Header section */}
            <div className="font-bold text-xs uppercase tracking-wider w-full px-4 py-2 pt-3 flex items-center justify-between bg-bg-surface border-b border-border rounded-none">
                <span>Console Output</span>
                {isLoading && (
                    <span className="text-warning animate-pulse normal-case tracking-normal font-normal">
                        running…
                    </span>
                )}
                {waitingForInput && !isLoading && (
                    <span className="text-warning normal-case tracking-normal font-normal">
                        waiting for input…
                    </span>
                )}
            </div>

            {/* Terminal logs list */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 leading-relaxed space-y-0.5 rounded-none"
            >
                {hasNoOutput ? (
                    <span className="text-comment italic">
                        Click &quot;run&quot; to see results here…
                    </span>
                ) : (
                    lines.map((line, index) => (
                        <div
                            key={index}
                            className={`whitespace-pre-wrap text-sm ${LINE_COLORS[line.type]}`}
                        >
                            {line.type === "input"
                                ? `> ${line.text}`
                                : line.text}
                        </div>
                    ))
                )}

                {/* Input prompt line */}
                {waitingForInput && (
                    <div className="flex items-center gap-1 mt-1 rounded-none">
                        <span className="text-warning select-none">&gt;</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none caret-warning text-warning text-sm rounded-none"
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
