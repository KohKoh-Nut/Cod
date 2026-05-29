"use client";

import { useAutoScroll } from "@/hooks/useAutoScroll";

interface CodeOutputProps {
    output: string;
    isLoading: boolean;
}

/**
 * Presentational component that renders script execution states and console output streams.
 */
export default function CodeOutput({ output, isLoading }: CodeOutputProps) {
    const scrollRef = useAutoScroll(output);

    const baseContainer = [
        "font-mono text-xs",
        "w-full h-full",
        "flex flex-col overflow-hidden",
        "bg-burnt-charcoal text-fossil-bone",
    ].join(" ");

    const baseHeader = [
        "font-bold text-xs uppercase tracking-wider",
        "w-full px-4 py-2 pt-3",
        "flex items-center justify-between",
        "bg-canyon-floor text-dusty_parchmentfg",
        "border-b border-crushed-clay",
    ].join(" ");

    const baseOutput = [
        "text-sm p-4 leading-relaxed whitespace-pre-wrap",
        "flex-1 overflow-y-auto",
    ].join(" ");

    return (
        <div className={baseContainer}>
            <div className={baseHeader}>Console Output</div>

            <div ref={scrollRef} className={baseOutput}>
                {isLoading ? (
                    <span className="text-warning animate-pulse">
                        Executing script...
                    </span>
                ) : output ? (
                    <span className="text-fg">{output}</span>
                ) : (
                    <span className="text-comment italic">
                        {'Click "run" to see results here...'}
                    </span>
                )}
            </div>
        </div>
    );
}
