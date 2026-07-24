"use client";

import { useState, useEffect, useRef } from "react";
import Popup from "@/components/ui/Popup";

interface SavePanelProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    language: string;
}

// file extension to suggest for each language
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

// popup for downloading the current code as a local file, with a
// filename field that keeps its extension in sync with the language
export default function SavePanel({
    isOpen,
    onClose,
    code,
    language,
}: SavePanelProps) {
    const ext = LANGUAGE_EXTENSIONS[language] ?? "txt";

    // keeps the user's chosen base name separate from the extension, so
    // switching languages updates the extension without touching what
    // they typed
    const baseRef = useRef("code");
    const [filename, setFilename] = useState(`code.${ext}`);
    const inputRef = useRef<HTMLInputElement>(null);

    // reset the filename and focus the field each time the panel opens
    useEffect(() => {
        if (!isOpen) return;
        setFilename(`${baseRef.current}.${ext}`);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen, ext]);

    // builds a downloadable blob and triggers the browser's save dialog
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

        // keep the base name ref in sync so a later language switch
        // still preserves whatever the user renamed it to
        baseRef.current = val.includes(".")
            ? val.slice(0, val.lastIndexOf("."))
            : val;
        setFilename(val);
    };

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title="Save File"
            maxWidth="md"
        >
            <div className="space-y-6">
                <p className="text-xs text-fg-muted -mt-3">
                    Extension auto-set for{" "}
                    <span className="text-interactive font-mono">
                        {language}
                    </span>
                    .
                </p>

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
        </Popup>
    );
}
