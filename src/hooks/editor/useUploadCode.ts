import { useRef } from "react";

// maps file extensions to the editor's language identifiers
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

// handles picking a local file, guessing its language from the
// extension, and loading its text content into the editor
export function useUploadCode(
    onLoad: (content: string) => void,
    disabled = false,
    onLanguageChange?: (lang: string) => void,
) {
    const inputRef = useRef<HTMLInputElement>(null);

    // opens the hidden file input
    const triggerUpload = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const file = e.target.files?.[0];
        if (!file) return;

        // switch the editor's language if we recognise the file extension
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

        // clear the input so selecting the same file again still fires onChange
        e.target.value = "";
    };

    return { inputRef, triggerUpload, handleFileChange };
}
