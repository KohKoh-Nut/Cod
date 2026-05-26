"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor() {
    const [code, setCode] = useState<string | undefined>(
        [
            "# Type your code here",
            "def hello():",
            '   print("Hello, World!")',
            "",
            "hello()",
        ].join("\n"),
    );

    return (
        <div className="h-full w-full c-border-static">
            <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
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
