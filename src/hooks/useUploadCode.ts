import { useRef } from "react";

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    rs: "rust",
    r: "r",
    go: "go",
    rb: "ruby",
    php: "php",
    scala: "scala",
    pl: "perl",
    sh: "bash",
    bash: "bash",
    lua: "lua",
    hs: "haskell",
};

export function useUploadCode(
    onLoad: (content: string) => void,
    disabled = false,
    onLanguageChange?: (lang: string) => void,
) {
    const inputRef = useRef<HTMLInputElement>(null);

    const triggerUpload = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const file = e.target.files?.[0];
        if (!file) return;

        // Detect language from file extension and auto-switch if recognised
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const detectedLang = EXTENSION_TO_LANGUAGE[ext];
        if (detectedLang && onLanguageChange) {
            onLanguageChange(detectedLang);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text === "string") {
                onLoad(text);
            }
        };

        reader.readAsText(file);
        // Reset input value to allow re-uploading the same file
        e.target.value = "";
    };

    return { inputRef, triggerUpload, handleFileChange };
}
