"use client";

import { useEffect, useState } from "react";
import {
    useCodeExecution,
    SUPPORTED_LANGUAGES,
} from "@/hooks/useCodeExecution";
import { useTimer } from "@/hooks/useTimer";
import { INITIAL_PYTHON_CODE } from "@/constants/codeSample";
import { useShareCode, ShareHistoryEntry } from "@/hooks/useShareCode";
import { supabase } from "@/utils/supabase-client";
import ButtonBar from "@/modules/ButtonBar";
import CodeOutput from "@/components/Code/CodeOutput";
import CodeEditor from "@/components/Code/CodeEditor";
import Text from "@/components/Text";
import ShareModal from "@/modules/SharePanel";
import { useCopyCode } from "@/hooks/useCopyCode";
import { useSaveCode } from "@/hooks/useSaveCode";
import { useUploadCode } from "@/hooks/useUploadCode";

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

    const [currentHistory, setCurrentHistory] = useState<ShareHistoryEntry[]>(
        [],
    );
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generatedShareUrl, setGeneratedShareUrl] = useState("");

    const { copy, copied } = useCopyCode();
    const { saveCode } = useSaveCode();
    const { inputRef, triggerUpload, handleFileChange } = useUploadCode(
        setCode,
        isReadOnly,
    );

    // Sync initial workspace state from shared link or forked storage
    useEffect(() => {
        const handleUrlLoading = async () => {
            const forkedCode = localStorage.getItem("forked_code");
            const forkedLang = localStorage.getItem("forked_lang");

            // Load from local storage if workspace was forked
            if (forkedCode && forkedLang) {
                setLanguage(forkedLang);
                setTimeout(() => {
                    setCode(forkedCode);
                    localStorage.removeItem("forked_code");
                    localStorage.removeItem("forked_lang");
                    setIsInitialLoading(false);
                }, 100);
                return;
            }

            // Fetch record from Supabase if URL contains a share hash
            const currentHash = window.location.hash;
            if (currentHash.startsWith("#/share/")) {
                const shareId = currentHash.replace("#/share/", "");
                window.location.hash = "";

                if (shareId) {
                    try {
                        const { data, error } = await supabase
                            .from("shares")
                            .select("*")
                            .eq("id", shareId)
                            .single();

                        if (!error && data) {
                            setLanguage(data.language);

                            // Short timeout lets the hook settle its language change first
                            setTimeout(() => {
                                setCode(data.code);
                                setCurrentHistory(
                                    (data.history as ShareHistoryEntry[]) || [],
                                );
                                setIsReadOnly(true);
                                setIsInitialLoading(false);
                            }, 150);
                            return;
                        }
                    } catch (err) {
                        console.error("Database fetch failed:", err);
                    }
                }
            }

            setIsInitialLoading(false);
        };

        handleUrlLoading();
    }, [setCode, setLanguage]);

    const { handleShare, isSharing } = useShareCode(
        code,
        language,
        currentHistory,
    );

    // Dynamic sharing trigger function linked to our customized hook structure
    const onShareButtonClick = async () => {
        const url = await handleShare();
        if (url) {
            setGeneratedShareUrl(url);
            setIsModalOpen(true);
        }
    };

    const handleFork = () => {
        window.location.hash = "";
        setIsReadOnly(false);
        alert(
            "Workspace successfully forked! You can now edit and re-share this module.",
        );
    };

    const handleClear = () => {
        if (isReadOnly) return;
        setCode("");
    };

    const buttonList = [
        { label: "save", onClick: () => saveCode(code) },
        ...(!isReadOnly
            ? [
                  {
                      label: "upload",
                      onClick: isReadOnly ? undefined : triggerUpload,
                      disabled: isReadOnly,
                  },
              ]
            : []),
        { label: copied ? "copied!" : "copy", onClick: () => copy(code) },
        ...(!isReadOnly
            ? [
                  {
                      label: "clear",
                      onClick: handleClear,
                  },
              ]
            : []),
        isReadOnly
            ? { label: "fork", onClick: handleFork }
            : {
                  label: isSharing ? "sharing..." : "share",
                  onClick: onShareButtonClick,
              },
        { label: isLoading ? "running..." : "run", onClick: handleRunCode },
    ];

    // Layout configuration styles
    const containerClass =
        "w-full min-h-0 flex-1 flex flex-row justify-between items-stretch gap-4 bg-bg text-fg rounded-none";
    const editOutWrapperClass =
        "h-full min-h-0 min-w-0 flex-1 flex flex-row justify-between gap-4 rounded-none";
    const editorContainerClass =
        "min-w-0 flex flex-col items-stretch h-full flex-1 rounded-none";
    const outputContainerClass =
        "min-h-0 overflow-hidden h-full flex-1 rounded-none";

    if (isInitialLoading) {
        return (
            <main className="c-page-layout rounded-none flex items-center justify-center bg-bg text-fg text-sm font-mono">
                syncing workspace instance state...
            </main>
        );
    }

    return (
        <main className="c-page-layout rounded-none">
            {/* Toolbar section */}
            <div className="flex flex-row justify-start gap-4 p-4 items-center flex-wrap rounded-none">
                <Text label="COD" formatting="bold"/>
                <Text label={`| Time  ${timeString}`} />

                <select
                    value={language}
                    disabled={isReadOnly}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-bg-surface text-fg border border-border px-2 py-1 text-sm capitalize cursor-pointer focus:outline-none focus:border-brand rounded-none"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>

                {language === "python" && !pyodideReady && (
                    <span className="text-comment text-xs italic animate-pulse font-mono">
                        loading python runtime…
                    </span>
                )}

                <ButtonBar buttons={buttonList} />

                <input
                    ref={inputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Split Editor and Output panels */}
            <div className={containerClass}>
                <div className={editOutWrapperClass}>
                    {/* Editor Panel */}
                    <div className={editorContainerClass}>
                        {isReadOnly && (
                            <div className="bg-bg-surface border border-border px-3 py-1.5 text-xs text-interactive italic flex justify-between items-center mb-2 rounded-none animate-fade-in font-mono">
                                Viewing shared code snapshot (Read-Only Mode)
                            </div>
                        )}
                        <CodeEditor
                            value={code}
                            onChange={(val) =>
                                !isReadOnly && setCode(val ?? "")
                            }
                            language={language}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* Terminal Output Panel */}
                    <div className={outputContainerClass}>
                        <CodeOutput
                            lines={lines}
                            isLoading={isLoading}
                            waitingForInput={waitingForInput}
                            onSubmitInput={submitInput}
                        />
                    </div>
                </div>
            </div>

            {/* Share Panel Modal Component Overlay */}
            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shareUrl={generatedShareUrl}
            />
        </main>
    );
}
