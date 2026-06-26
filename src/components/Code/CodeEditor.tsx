"use client";

import dynamic from "next/dynamic";

export interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
}

// Map custom language names to Monaco supported identifiers
const LANGUAGE_MAP: Record<string, string> = {
    "c++": "cpp",
    cpp: "cpp",
};

// Lazy load Monaco Editor to disable SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center text-fg bg-bg font-mono rounded-none">
            Loading Monaco Editor...
        </div>
    ),
});

export default function CodeEditor({
    value,
    onChange,
    language = "python",
    readOnly = false,
}: CodeEditorProps) {
    const editorLanguage = LANGUAGE_MAP[language] ?? language;

    return (
        <div className="h-full w-full min-h-0 rounded-none">
            <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={editorLanguage}
                value={value}
                onChange={onChange}
                options={{
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    minimap: { enabled: true },
                    readOnly: readOnly,
                    domReadOnly: readOnly, // Prevents virtual keyboard popup on mobile when read-only
                }}
            />
        </div>
    );
}
