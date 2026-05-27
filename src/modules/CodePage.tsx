"use client";

import { useState } from "react";
import Button from "@/components/Button";
import AnchoredButton from "@/components/AnchoredButton";
import CodeOutput from "@/components/CodeOutput";
import CodeEditor from "@/components/CodeEditor";

export default function CodePage() {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [output, setOutput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Initialize standard workspace buffer with valid runtime Python indentation formatting
    const [code, setCode] = useState<string>(
        [
            "# Type your code here",
            "def hello():",
            '    print("Hello, World!")',
            "",
            "hello()",
        ].join("\n"),
    );

    // Dispatches the payload buffer string natively over to the Next.js execution route
    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput("");

        try {
            const response = await fetch("/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.error) {
                setOutput(data.error);
            } else {
                setOutput(
                    data.run?.output ||
                        "Code executed successfully with no output logs.",
                );
            }
        } catch (error) {
            setOutput("Execution Error: Internal server error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="c-page-layout">
            {/* Meta header labels */}
            <div className="flex flex-row justify-start gap-20">
                <p className="font-base">{"Task-001"}</p>
                <p className="font-base">{"Time"}</p>
                {/* Task interaction toolbar operations */}
                <div className="flex flex-row justify-left p-4 gap-2">
                    <Button label="save" />
                    <Button label="copy" />
                    <Button label="share" />
                    <Button label="upload" />
                    <Button
                        label={isLoading ? "running..." : "run"}
                        onClick={handleRunCode}
                    />
                </div>
            </div>

            {/* Split layout workspace panels */}
            <div className="flex flex-row justify-between gap-5 flex-1 w-full items-stretch">
                <div
                    className={`flex flex-1 h-full min-w-0 ${isVisible ? "flex-col" : "flex-row justify-between gap-5"}`}
                >
                    {/* Primary code compiler workspace setup */}
                    <div
                        className={`flex flex-col items-stretch min-w-0 ${
                            isVisible ? "flex-8 min-h-0" : "h-full flex-1"
                        }`}
                    >
                        {/* Dynamic Monaco instance rendering module */}
                        <div className="h-full w-full min-h-0">
                            <CodeEditor
                                value={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>
                    </div>

                    {/* Stream output logging terminal area */}
                    <div
                        className={`${
                            isVisible ? "w-full flex-3" : "h-full flex-1"
                        }`}
                    >
                        <CodeOutput output={output} isLoading={isLoading} />
                    </div>
                </div>

                {/* Optional side-panel assistant container block */}
                {isVisible && (
                    <div className="border border-black bg-blue-500 h-full flex-1"></div>
                )}
            </div>

            {/* Float helper action anchor trigger button */}
            <AnchoredButton
                label="AI"
                onClick={() => setIsVisible(!isVisible)}
            />
        </main>
    );
}
