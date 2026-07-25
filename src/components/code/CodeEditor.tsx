"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/hooks/ui/useTheme";

export interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
}

// our language ids that don't already match Monaco's own identifiers
const LANGUAGE_MAP: Record<string, string> = {
    "c++": "cpp",
    cpp: "cpp",
};

// Monaco doesn't support server-side rendering, so it's loaded client-only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center text-fg bg-bg font-mono rounded-none">
            Loading Monaco Editor...
        </div>
    ),
});

// thin wrapper around Monaco that plugs in the app's theme and
// normalizes language ids
export default function CodeEditor({
    value,
    onChange,
    language = "python",
    readOnly = false,
}: CodeEditorProps) {
    const { resolvedTheme } = useTheme();
    const editorLanguage = LANGUAGE_MAP[language] ?? language;

    return (
        <div className="h-full w-full min-h-0 rounded-none">
            <MonacoEditor
                height="100%"
                theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
                language={editorLanguage}
                value={value}
                onChange={onChange}
                options={{
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    minimap: { enabled: true },
                    readOnly: readOnly,
                    // domReadOnly also stops the on-screen keyboard from
                    // popping up on mobile while read-only
                    domReadOnly: readOnly,
                }}
            />
        </div>
    );
}
