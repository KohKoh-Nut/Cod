"use client";

import { useState, useEffect, useRef } from "react";

interface SavePanelProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    language: string;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    c: "c",
    cpp: "cpp",
    rust: "rs",
    r: "r",
    go: "go",
    ruby: "rb",
    php: "php",
    scala: "scala",
    perl: "pl",
    bash: "sh",
    lua: "lua",
    haskell: "hs",
};

export default function SavePanel({
    isOpen,
    onClose,
    code,
    language,
}: SavePanelProps) {
    const ext = LANGUAGE_EXTENSIONS[language] ?? "txt";
    // Track the user's chosen base name separately so the effect never reads state
    const baseRef = useRef("code");
    const [filename, setFilename] = useState(`code.${ext}`);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync extension when language changes or panel opens
    useEffect(() => {
        if (!isOpen) return;
        const next = `${baseRef.current}.${ext}`;
        setFilename(next);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen, ext]);

    if (!isOpen) return null;

    const handleSave = () => {
        const name = filename.trim() || `code.${ext}`;
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Keep base name ref in sync so language switches preserve it
        baseRef.current = val.includes(".")
            ? val.slice(0, val.lastIndexOf("."))
            : val;
        setFilename(val);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-md border border-border bg-bg-surface p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-fg-muted hover:text-fg transition p-1"
                    aria-label="Close panel"
                >
                    ✕
                </button>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-fg">Save File</h3>
                        <p className="text-xs text-fg-muted">
                            Extension auto-set for{" "}
                            <span className="text-interactive font-mono">
                                {language}
                            </span>
                            .
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                            Filename:
                        </span>
                        <div className="flex items-center gap-2 border border-border bg-bg p-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={filename}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder={`code.${ext}`}
                                className="w-full bg-transparent text-xs text-interactive outline-none font-mono"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-2.5 bg-brand hover:bg-brand-hover text-bg font-bold uppercase text-xs transition font-mono"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}
