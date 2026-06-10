"use client";

import { useState } from "react";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useTimer } from "@/hooks/useTimer";
import { INITIAL_PYTHON_CODE } from "@/constants/codeSample";
import ButtonBar from "@/modules/ButtonBar";
import Button from "@/components/Button";
import CodeOutput from "@/components/Code/CodeOutput";
import CodeEditor from "@/components/Code/CodeEditor";
import Chat from "@/modules/Chat";
import Text from "@/components/Text";

/**
 * Main dashboard application layout managing state coordination between the code editor,
 * code execution pipeline, background runtime timers, and dynamic responsive side panels.
 */
export default function Home() {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const { timeString } = useTimer();

    const { code, setCode, output, isLoading, handleRunCode } =
        useCodeExecution(INITIAL_PYTHON_CODE);

    const buttonList = [
        { label: "save" },
        { label: "copy" },
        { label: "share" },
        { label: "upload" },
        {
            label: isLoading ? "running..." : "run",
            onClick: handleRunCode,
        },
    ];

    // Responsive workspace grid layout classes
    const baseContainer = [
        "w-full min-h-0 flex-1",
        "flex flex-row justify-between",
        "items-stretch  gap-4",
        "bg-burnt-charcoal text-fossil-bone",
    ].join(" ");

    const baseEditOutContainer = [
        "h-full min-h-0 min-w-0 flex-1",
        "flex",
        isVisible ? "flex-col" : "flex-row justify-between gap-4",
    ].join(" ");

    const baseEditorContainer = [
        "min-w-0",
        "flex flex-col items-stretch",
        isVisible ? "min-h-0 flex-8" : "h-full flex-1",
    ].join(" ");

    const baseOutputContainer = [
        "min-h-0 overflow-hidden ",
        isVisible ? "w-full flex-3" : "h-full flex-1",
    ].join(" ");

    return (
        <main className="c-page-layout">
            <div className="flex flex-row justify-start gap-20 p-4">
                <Text label={"Task-001"} />
                <Text label={`Time  ${timeString}`} />
                <ButtonBar buttons={buttonList} />
            </div>

            <div className={`${baseContainer}`}>
                <div className={`${baseEditOutContainer}`}>
                    <div className={`${baseEditorContainer}`}>
                        <CodeEditor
                            value={code}
                            onChange={(val) => setCode(val || "")}
                        />
                    </div>

                    <div className={`${baseOutputContainer}`}>
                        <CodeOutput output={output} isLoading={isLoading} />
                    </div>
                </div>

                {/* Optional side-panel assistant container block */}
                {isVisible && <Chat className="flex-1" />}
            </div>

            <Button
                label={isVisible ? "X" : "AI"}
                onClick={() => setIsVisible(!isVisible)}
                className="fixed bottom-24 right-6"
            />
        </main>
    );
}
