"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { BASE_PATH } from "@/utils/basePath";
import { Share, ShareVisibility } from "@/types/share";
import { useDialog } from "@/hooks/ui/useDialog";
import HistoryPanel from "@/components/panels/HistoryPanel";

interface ShareCardProps {
    share: Share;
    isOwner: boolean;
    onDelete?: (id: string) => void | Promise<void>;
}

// display label with icon for each visibility level
const VISIBILITY_LABELS: Record<ShareVisibility, string> = {
    public: "🌐 Public",
    friends: "👥 Friends",
    private: "🔒 Private",
};

// one card in a shares list: preview, metadata, and the copy/fork/
// history/delete actions
export default function ShareCard({
    share,
    isOwner,
    onDelete,
}: ShareCardProps) {
    const router = useRouter();
    const { alert, confirm } = useDialog();
    const [forking, setForking] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const totalLines = share.code.split("\n").length;
    const previewSnippet =
        share.code.slice(0, 200) + (share.code.length > 200 ? "..." : "");
    const sharedLink = `${window.location.origin}${BASE_PATH}/#/share/${share.id}`;

    // uses a real navigation instead of router.push, since Next's router
    // treats a push that only differs by hash as a scroll-to-anchor and
    // does nothing -- this matches what typing the url in manually would do
    const goToShare = () => {
        window.location.href = sharedLink;
    };

    // copies the shareable link without triggering the card's own click
    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(sharedLink);
        await alert("Link copied to clipboard!");
    };

    // stages a copy of this share as a draft in localStorage, which the
    // editor picks up on the next page load, then sends the user there
    const handleFork = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setForking(true);

        const { data, error } = await supabase
            .from("shares")
            .select("code, language, history, visibility")
            .eq("id", share.id)
            .single();

        if (error || !data) {
            console.error("Error forking share:", error?.message);
            setForking(false);
            return;
        }

        // for friends-only shares, carry over the original recipients so
        // the forked version defaults to the same audience
        let friendCandidates: string[] = [];
        if (data.visibility === "friends") {
            const { data: ids, error: recError } = await supabase.rpc(
                "get_share_recipient_ids",
                {
                    p_share_id: share.id,
                },
            );
            if (recError)
                console.error("Error fetching recipients:", recError.message);
            friendCandidates = [
                ...new Set([share.user_id, ...((ids ?? []) as string[])]),
            ];
        }

        localStorage.setItem("forked_code", data.code);
        localStorage.setItem("forked_lang", data.language);
        localStorage.setItem("forked_from_id", share.id);
        localStorage.setItem(
            "forked_history",
            JSON.stringify(data.history ?? []),
        );
        localStorage.setItem("forked_visibility", data.visibility);
        localStorage.setItem(
            "forked_recipient_ids",
            JSON.stringify(friendCandidates),
        );
        setForking(false);
        router.push("/");
    };

    // asks for confirmation before deleting, since this can't be undone
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onDelete) return;
        const confirmed = await confirm(
            "Are you sure you want to delete this module?",
        );
        if (!confirmed) return;
        await onDelete(share.id);
    };

    const handleOpenHistory = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHistoryOpen(true);
    };

    return (
        <div
            onClick={goToShare}
            className="p-4 border border-border rounded-none bg-bg-surface hover:border-comment transition duration-200 cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-bg text-interactive font-mono text-xs uppercase border border-border">
                        {share.language}
                    </span>
                    <span className="px-2 py-0.5 text-fg-muted font-mono text-[10px] uppercase border border-border">
                        {VISIBILITY_LABELS[share.visibility]}
                    </span>
                    <span className="text-xs text-fg-muted">
                        {new Date(share.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="px-2 py-1 border border-border hover:border-interactive text-fg-muted hover:text-interactive transition text-[10px] uppercase font-bold tracking-wider"
                    >
                        Copy
                    </button>
                    <button
                        onClick={handleFork}
                        className="px-2 py-1 border border-border hover:border-interactive text-fg-muted hover:text-interactive transition text-[10px] uppercase font-bold tracking-wider"
                    >
                        {forking ? "Forking..." : "Fork"}
                    </button>
                    <button
                        onClick={handleOpenHistory}
                        className="px-2 py-1 border border-border hover:border-interactive text-fg-muted hover:text-interactive transition text-[10px] uppercase font-bold tracking-wider"
                    >
                        History
                    </button>
                    {/* delete is only available to the share's owner */}
                    {isOwner && onDelete && (
                        <button
                            onClick={handleDelete}
                            className="px-2 py-1 border border-border hover:border-error text-fg-muted hover:text-error transition text-[10px] uppercase font-bold tracking-wider"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <pre className="font-mono text-[10px] text-fg-muted bg-bg p-3 rounded-none border border-border whitespace-pre-wrap overflow-hidden text-ellipsis max-h-32">
                {previewSnippet || "empty snapshot..."}
            </pre>

            <div className="mt-3 flex gap-4 text-[10px] text-fg-muted uppercase font-bold tracking-wider">
                <span>Lines: {totalLines}</span>
                <span>Revisions: {share.history?.length ?? 1}</span>
            </div>

            {/* stop clicks inside the history panel from also triggering
                the card's own navigation */}
            <div onClick={(e) => e.stopPropagation()}>
                <HistoryPanel
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    shareId={share.id}
                />
            </div>
        </div>
    );
}
