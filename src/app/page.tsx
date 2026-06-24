"use client";

import { useState } from "react";
import {
    useCodeExecution,
    SUPPORTED_LANGUAGES,
} from "@/hooks/useCodeExecution";
import { useTimer } from "@/hooks/useTimer";
import { INITIAL_PYTHON_CODE } from "@/constants/codeSample";
import ButtonBar from "@/modules/ButtonBar";
import Button from "@/components/Button";
import CodeOutput from "@/components/Code/CodeOutput";
import CodeEditor from "@/components/Code/CodeEditor";
import Text from "@/components/Text";

export default function Home() {
    const { timeString } = useTimer();
    const {
        code,
        setCode,
        language,
        setLanguage,
        lines,
        isLoading,
        waitingForInput,
        submitInput,
        handleRunCode,
        pyodideReady,
    } = useCodeExecution(INITIAL_PYTHON_CODE);

    const buttonList = [
        { label: "save" },
        { label: "copy" },
        { label: "share" },
        { label: "upload" },
        { label: isLoading ? "running..." : "run", onClick: handleRunCode },
    ];

    const baseContainer =
        "w-full min-h-0 flex-1 flex flex-row justify-between items-stretch gap-4 bg-burnt-charcoal text-fossil-bone";

    const baseEditOut =
        "h-full min-h-0 min-w-0 flex-1 flex flex-row justify-between gap-4";

    const baseEditorContainer =
        "min-w-0 flex flex-col items-stretch h-full flex-1";

    const baseOutputContainer = "min-h-0 overflow-hidden h-full flex-1";

    return (
        <main className="c-page-layout">
            <div className="flex flex-row justify-start gap-4 p-4 items-center flex-wrap">
                <Text label="Cod" />
                <Text label={`Time  ${timeString}`} />

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-burnt-charcoal text-fossil-bone border border-crushed-clay px-2 py-1 text-sm capitalize cursor-pointer"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>

                {language === "python" && !pyodideReady && (
                    <span className="text-comment text-xs italic animate-pulse">
                        loading python runtime…
                    </span>
                )}

                <ButtonBar buttons={buttonList} />
            </div>

            <div className={baseContainer}>
                <div className={baseEditOut}>
                    <div className={baseEditorContainer}>
                        <CodeEditor
                            value={code}
                            onChange={(val) => setCode(val ?? "")}
                            language={language}
                        />
                    </div>

                    <div className={baseOutputContainer}>
                        <CodeOutput
                            lines={lines}
                            isLoading={isLoading}
                            waitingForInput={waitingForInput}
                            onSubmitInput={submitInput}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
