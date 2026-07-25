"use client";

import { useState } from "react";
import { ForkTreeNode } from "@/hooks/share/useForkTree";
import { BASE_PATH } from "@/utils/basePath";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

interface HistoryTreeRowProps {
    node: ForkTreeNode;
    depth: number;
    isLast: boolean;
    prefix: string;
    currentShareId: string | null;
}

// one line of the fork tree, drawn with ascii branch characters, plus
// its children when expanded. Shows either full details or a locked
// placeholder depending on whether the viewer can see this node.
export default function HistoryTreeRow({
    node,
    depth,
    isLast,
    prefix,
    currentShareId,
}: HistoryTreeRowProps) {
    const [expanded, setExpanded] = useState(true);
    const isCurrent = node.id === currentShareId;
    const hasChildren = node.children.length > 0;

    // ascii branch characters for this row and the prefix its children
    // will continue from, root has no branch of its own
    const branch = depth === 0 ? "" : prefix + (isLast ? "└─ " : "├─ ");
    const childPrefix = depth === 0 ? "" : prefix + (isLast ? "   " : "│  ");

    return (
        <>
            <div
                className={`flex items-center gap-2 py-1 text-xs font-mono whitespace-pre ${
                    isCurrent
                        ? "text-brand"
                        : node.visible
                          ? "text-fg"
                          : "text-comment italic"
                }`}
            >
                <span className="text-comment">{branch}</span>

                {hasChildren ? (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className="w-3 shrink-0 text-comment hover:text-fg transition"
                        aria-label={
                            expanded ? "Collapse branch" : "Expand branch"
                        }
                    >
                        {expanded ? "-" : "+"}
                    </button>
                ) : (
                    <span className="w-3 shrink-0" />
                )}

                {/* full details when the viewer is allowed to see this fork */}
                {node.visible ? (
                    <>
                        <span className="px-1.5 py-0.5 border border-border text-interactive bg-bg-element shrink-0">
                            {node.language}
                        </span>
                        <span className="text-fg-muted truncate">
                            {node.username ?? "unknown"}
                        </span>
                        <span className="text-comment shrink-0">
                            {formatDate(node.created_at)}
                        </span>
                        {isCurrent && (
                            <span className="text-brand font-bold shrink-0">
                                ← you are here
                            </span>
                        )}
                        <a
                            href={`${window.location.origin}${BASE_PATH}/#/share/${node.id}`}
                            className="text-brand hover:text-brand-hover underline underline-offset-2 ml-auto shrink-0"
                        >
                            view
                        </a>
                    </>
                ) : (
                    <span className="flex items-center gap-1.5">
                        <span aria-hidden="true">🔒</span>
                        locked fork
                    </span>
                )}
            </div>

            {/* recurse into children only while this branch is expanded */}
            {expanded &&
                node.children.map((child, i) => (
                    <HistoryTreeRow
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        isLast={i === node.children.length - 1}
                        prefix={childPrefix}
                        currentShareId={currentShareId}
                    />
                ))}
        </>
    );
}
