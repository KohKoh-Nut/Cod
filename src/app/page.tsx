"use client";

import { useState } from "react";
import Button from "@/components/Button";
import AnchoredButton from "@/components/AnchoredButton";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] bg-zinc-900 flex items-center justify-center text-zinc-400 rounded-lg border border-zinc-700">
            Loading Monaco Editor...
        </div>
    ),
});

export default function Home() {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    return (
        <main className="c-page-layout">
            <div className="flex flex-row justify-start gap-20">
                <p className="font-base">{"Task-001"}</p>
                <p className="font-base">{"Time"}</p>
            </div>
            <div className="flex flex-row justify-between gap-5 h-220 w-full items-stretch">
                <div className="flex flex-col justify-between flex-1 h-full min-w-0">
                    <div className="flex flex-row justify-left p-4 gap-2">
                        <Button label="save" />
                        <Button label="copy" />
                        <Button label="share" />
                        <Button label="upload" />
                        <Button label="run" />
                    </div>
                    <div className="h-full w-full flex-7 min-h-0">
                        <CodeEditor />
                    </div>
                    <div className="border border-black bg-green-500 h-full flex-3"></div>
                </div>
                {isVisible && (
                    <div className="border border-black bg-blue-500 h-full flex-1"></div>
                )}
            </div>

            <AnchoredButton
                label="AI"
                onClick={() => setIsVisible(!isVisible)}
            />
        </main>
    );
}
