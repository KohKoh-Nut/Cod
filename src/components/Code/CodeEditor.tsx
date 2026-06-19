"use client";
import dynamic from "next/dynamic";

export interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

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

// Monaco uses "cpp" but internally calls it "cpp" - remap display names if needed
const MONACO_LANGUAGE_MAP: Record<string, string> = {
    cpp: "cpp",
    "c++": "cpp",
};

export default function CodeEditor({
    value,
    onChange,
    language = "python",
}: CodeEditorProps) {
    const monacoLang = MONACO_LANGUAGE_MAP[language] ?? language;

    return (
        <div className="h-full w-full min-h-0">
            <MonacoEditorInner
                height="100%"
                language={monacoLang}
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
