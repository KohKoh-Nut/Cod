"use client";

import { useState } from "react";

import { useTimer } from "@/hooks/ui/useTimer";
import {
    useCodeExecution,
    SUPPORTED_LANGUAGES,
} from "@/hooks/editor/useCodeExecution";
import { useShareCode } from "@/hooks/share/useShareCode";
import { useCopyCode } from "@/hooks/editor/useCopyCode";
import { useUploadCode } from "@/hooks/editor/useUploadCode";
import { useWorkspaceSync } from "@/hooks/editor/useWorkspaceSync";
import { useWorkspaceDraft } from "@/hooks/editor/useWorkspaceDraft";
import { useDialog } from "@/hooks/ui/useDialog";
import { ShareVisibility } from "@/types/share";
import { ShareResult } from "@/hooks/share/useShareCode";
import Text from "@/components/ui/Text";
import CodeOutput from "@/components/code/CodeOutput";
import CodeEditor from "@/components/code/CodeEditor";
import ButtonBar from "@/components/panels/ButtonBar";
import SharePanel from "@/components/panels/SharePanel";
import SavePanel from "@/components/panels/SavePanel";
import HistoryPanel from "@/components/panels/HistoryPanel";
import { INITIAL_PYTHON_CODE } from "@/constants/codeSample";

// tailwind classes for the editor/output split layout, kept together
// since they all need to line up
const EDITOR_LAYOUT = {
    container:
        "w-full min-h-0 flex-1 flex flex-col md:flex-row justify-between items-stretch gap-4 bg-bg text-fg rounded-none",
    wrapper:
        "h-full min-h-0 min-w-0 flex-1 flex flex-col md:flex-row justify-between gap-4 rounded-none",
    editor: "min-w-0 min-h-0 flex flex-col items-stretch w-full h-full md:h-full flex-1 rounded-none",
    output: "min-h-0 min-w-0 overflow-hidden w-full flex-1 rounded-none",
};

// main editor page: language picker, code editor, run output, and the
// save/share/history/fork actions around them
export default function Home() {
    const { timeString } = useTimer();
    const { alert } = useDialog();

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

    const {
        isInitialLoading,
        isReadOnly,
        setIsReadOnly,
        accessDenied,
        currentHistory,
        currentShareId,
        setCurrentShareId,
        parentShareId,
        setParentShareId,
        defaultVisibility,
        defaultFriendIds,
    } = useWorkspaceSync(setCode, setLanguage);

    // keeps the draft around across page navigation, so it's still here
    // when the user comes back to the editor
    useWorkspaceDraft(code, language, isReadOnly, isInitialLoading);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // history panel needs a share id whether the code is currently
    // shared or was forked from something that was
    const historyShareId = currentShareId ?? parentShareId;

    const { copy, copied } = useCopyCode();
    const { inputRef, triggerUpload, handleFileChange } = useUploadCode(
        setCode,
        isReadOnly,
        setLanguage,
    );
    const { createShare, isSharing } = useShareCode(
        code,
        language,
        currentHistory,
        parentShareId,
    );

    const handleCreateShare = async (
        visibility: ShareVisibility,
        friendIds: string[],
    ): Promise<ShareResult | "AUTH_REQUIRED" | null> => {
        const result = await createShare(visibility, friendIds);
        if (result && result !== "AUTH_REQUIRED") {
            // newly created share becomes the current one, and it's no
            // longer just a pending fork
            setCurrentShareId(result.id);
            setParentShareId(null);
        }
        return result;
    };

    // drops the read-only lock from a shared snapshot so the user can
    // edit and later re-share it as their own fork
    const handleFork = async () => {
        window.location.hash = "";
        setParentShareId(currentShareId);
        setCurrentShareId(null);
        setIsReadOnly(false);
        await alert(
            "Workspace successfully forked! You can now edit and re-share this module.",
        );
    };

    const handleClear = () => {
        if (isReadOnly) return;
        setCode("");
    };

    // toolbar actions, with upload/clear hidden and share swapped for
    // fork while viewing a read-only shared snapshot
    const toolbarButtons = [
        { label: "Save", onClick: () => setIsSaveModalOpen(true) },
        ...(!isReadOnly ? [{ label: "Upload", onClick: triggerUpload }] : []),
        { label: copied ? "Copied!" : "Copy", onClick: () => copy(code) },
        ...(!isReadOnly ? [{ label: "Clear", onClick: handleClear }] : []),
        isReadOnly
            ? { label: "Fork", onClick: handleFork }
            : { label: "Share", onClick: () => setIsShareModalOpen(true) },
        { label: "History", onClick: () => setIsHistoryModalOpen(true) },
        {
            label: isLoading ? "Running..." : "Run",
            onClick: handleRunCode,
            disabled: isLoading,
        },
    ];

    // still restoring from a share link or fork draft
    if (isInitialLoading) {
        return (
            <main className="c-page-layout rounded-none flex items-center justify-center bg-bg text-fg text-sm font-mono">
                syncing workspace instance state...
            </main>
        );
    }

    // share link pointed at something the viewer can't open
    if (accessDenied) {
        return (
            <main className="c-page-layout rounded-none flex flex-col items-center justify-center gap-2 bg-bg text-fg text-sm font-mono">
                <span className="text-error">
                    🔒 You don't have access to this snapshot.
                </span>
                <span className="text-fg-muted text-xs">
                    Ask the owner to share it with you, or check you're signed
                    in to the right account.
                </span>
            </main>
        );
    }

    return (
        <main className="c-page-layout rounded-none">
            <div className="flex flex-row justify-start gap-4 p-4 items-center flex-wrap rounded-none">
                <Text label="COD" formatting="bold" className="font-mambo" />
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

                {/* pyodide is a large download, let the user know it's still loading */}
                {language === "python" && !pyodideReady && (
                    <span className="text-comment text-xs italic animate-pulse font-mono">
                        loading python runtime…
                    </span>
                )}

                <ButtonBar buttons={toolbarButtons} />

                {/* hidden, triggered programmatically by the upload button */}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".py,.js,.ts,.c,.cpp,.cc,.cxx,.rs,.r,.go,.rb,.php,.scala,.pl,.sh,.bash,.lua,.hs,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <div className={EDITOR_LAYOUT.container}>
                <div className={EDITOR_LAYOUT.wrapper}>
                    <div className={EDITOR_LAYOUT.editor}>
                        {/* shown while viewing someone else's shared code */}
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

                    <div className={EDITOR_LAYOUT.output}>
                        <CodeOutput
                            lines={lines}
                            isLoading={isLoading}
                            waitingForInput={waitingForInput}
                            onSubmitInput={submitInput}
                        />
                    </div>
                </div>
            </div>

            <SavePanel
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                code={code}
                language={language}
            />

            <SharePanel
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                isCreating={isSharing}
                defaultVisibility={defaultVisibility}
                defaultFriendIds={defaultFriendIds}
                onCreateShare={handleCreateShare}
            />

            <HistoryPanel
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                shareId={historyShareId}
            />
        </main>
    );
}
