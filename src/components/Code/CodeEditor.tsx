"use client";

import dynamic from "next/dynamic";

export interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

// Client-side only import to prevent SSR compilation errors with Monaco Editor
const MonacoEditorInner = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center text-fg bg-burnt-charcoal">
                Loading Monaco Editor...
            </div>
        ),
    },
);

/**
 * Next.js compatible Monaco Editor wrapper for code editing and configuration.
 */
export default function CodeEditor({ value, onChange }: CodeEditorProps) {
    return (
        <div className="h-full w-full min-h-0">
            <MonacoEditorInner
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={value}
                onChange={onChange}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
