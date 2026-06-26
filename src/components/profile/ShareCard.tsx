"use client";

import { useRouter } from "next/navigation";
import { UserShareItem } from "@/hooks/useProfileData";

interface ShareCardProps {
    item: UserShareItem;
    onDelete: (id: string) => Promise<void>;
}

export function ShareCard({ item, onDelete }: ShareCardProps) {
    const router = useRouter();

    const totalLines = item.code.split("\n").length;
    const previewSnippet =
        item.code.slice(0, 80) + (item.code.length > 80 ? "..." : "");
    const sharedLink = `${window.location.origin}/#/share/${item.id}`;

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(sharedLink);
        alert("Link copied to clipboard!");
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this module?")) return;
        await onDelete(item.id);
    };

    return (
        <div
            onClick={() => router.push(`./#/share/${item.id}`)}
            className="p-4 border border-border rounded-none bg-bg-surface hover:border-comment transition duration-200 cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-bg text-interactive font-mono text-xs uppercase border border-border">
                        {item.language}
                    </span>
                    <span className="text-xs text-fg-muted">
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="px-2 py-1 border border-border hover:border-interactive text-fg-muted hover:text-interactive transition text-[10px] uppercase font-bold tracking-wider"
                    >
                        Copy
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-2 py-1 border border-border hover:border-error text-fg-muted hover:text-error transition text-[10px] uppercase font-bold tracking-wider"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <p className="font-mono text-[10px] text-fg-muted bg-bg p-3 rounded-none border border-border whitespace-pre overflow-hidden text-ellipsis">
                {previewSnippet || "empty snapshot..."}
            </p>

            <div className="mt-3 flex gap-4 text-[10px] text-fg-muted uppercase font-bold tracking-wider">
                <span>Lines: {totalLines}</span>
                <span>Revisions: {item.history?.length ?? 1}</span>
            </div>
        </div>
    );
}
