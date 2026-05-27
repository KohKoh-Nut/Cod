"use client";

import dynamic from "next/dynamic";

export interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

// Lazy-load the third-party editor core on the client side to avoid Node server-side compilation crashes
const MonacoEditorInner = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-400 rounded-lg border border-zinc-700">
                Loading Monaco Editor...
            </div>
        ),
    },
);

// Standard React wrapper component designed to expose clean types directly to Next.js parent pages
export default function CodeEditor({ value, onChange }: CodeEditorProps) {
    return (
        <div className="h-full w-full">
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
