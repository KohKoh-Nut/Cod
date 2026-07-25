"use client";

import Popup from "@/components/ui/Popup";
import { useForkTree } from "@/hooks/share/useForkTree";
import HistoryTreeRow from "@/components/panels/HistoryTreeRow";

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;

    // the share this panel was opened from -- null means the current code
    // has never been shared, so the panel still opens but shows an empty state
    shareId: string | null;
}

// popup showing a share's full fork tree, from the original snapshot
// down through every fork made from it
export default function HistoryPanel({
    isOpen,
    onClose,
    shareId,
}: HistoryPanelProps) {
    const { loading, error, tree } = useForkTree(shareId, isOpen);

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title="Fork History"
            description="The lineage of this snapshot, from first edition to every fork."
            maxWidth="2xl"
        >
            <div className="overflow-y-auto max-h-[60vh] border border-border bg-bg p-3">
                {loading && (
                    <p className="text-xs text-comment font-mono animate-pulse">
                        walking the tree...
                    </p>
                )}

                {!loading && error && (
                    <p className="text-xs text-error font-mono">{error}</p>
                )}

                {!loading && !error && !shareId && (
                    <p className="text-xs text-fg-muted font-mono">
                        This code hasn't been shared yet -- share it to start a
                        fork history.
                    </p>
                )}

                {!loading && !error && shareId && !tree && (
                    <p className="text-xs text-fg-muted font-mono">
                        No visible history for this snapshot.
                    </p>
                )}

                {!loading && !error && tree && (
                    <HistoryTreeRow
                        node={tree}
                        depth={0}
                        isLast={true}
                        prefix=""
                        currentShareId={shareId}
                    />
                )}
            </div>
        </Popup>
    );
}
