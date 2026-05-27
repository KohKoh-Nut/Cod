"use client";

interface CodeOutputProps {
    output: string;
    isLoading: boolean;
}

// Presentational component responsible for rendering script compilation logs and systemic execution run states
export default function CodeOutput({ output, isLoading }: CodeOutputProps) {
    return (
        <div className="w-full h-full bg-zinc-950 border border-zinc-800 flex flex-col font-mono shadow-2xl overflow-hidden text-white">
            {/* Terminal header panel component */}
            <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Console Output
                </span>
            </div>

            {/* Interactive display stream panel area */}
            <div className="flex-1 p-4 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                {isLoading ? (
                    <span className="text-amber-500 animate-pulse">
                        Executing script...
                    </span>
                ) : output ? (
                    <span className="text-zinc-200">{output}</span>
                ) : (
                    <span className="text-zinc-600 italic">
                        Click "run" to see results here...
                    </span>
                )}
            </div>
        </div>
    );
}
