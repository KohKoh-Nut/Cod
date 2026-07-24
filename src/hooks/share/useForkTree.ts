import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase-client";
import { ShareHistoryEntry } from "@/hooks/share/useShareCode";

export interface ForkTreeNode {
    id: string;
    user_id: string | null;
    username: string | null;
    language: string | null;
    created_at: string;
    history: ShareHistoryEntry[] | null;
    // false when this node stands in for a fork the viewer isn't allowed
    // to see -- kept in the tree so the branch shape is still visible,
    // just without any details
    visible: boolean;
    children: ForkTreeNode[];
}

interface TreeRow {
    id: string;
    parent_share_id: string | null;
    user_id: string | null;
    language: string | null;
    created_at: string;
    history: ShareHistoryEntry[] | null;
    visible: boolean;
}

// works out which rows stay in the tree: a row is kept if it's visible
// itself, or if any of its descendants are kept (so the branch leading
// to a visible descendant doesn't just disappear)
function computeKeptIds(rows: TreeRow[], childrenOf: Map<string, TreeRow[]>) {
    const kept = new Set<string>();

    // process newest first so every child is already resolved by the
    // time we look at its parent
    const newestFirst = [...rows].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
    );

    for (const row of newestFirst) {
        const hasKeptChild = (childrenOf.get(row.id) ?? []).some((c) =>
            kept.has(c.id),
        );
        if (row.visible || hasKeptChild) kept.add(row.id);
    }
    return kept;
}

// turns the flat row list into a nested tree starting at rootId,
// dropping any rows that computeKeptIds decided to exclude
function buildTree(
    rootId: string,
    byId: Map<string, TreeRow>,
    childrenOf: Map<string, TreeRow[]>,
    keptIds: Set<string>,
    usernamesById: Map<string, string>,
): ForkTreeNode | null {
    const buildNode = (row: TreeRow): ForkTreeNode | null => {
        if (!keptIds.has(row.id)) return null;
        const children = (childrenOf.get(row.id) ?? [])
            .map(buildNode)
            .filter((n): n is ForkTreeNode => n !== null);
        return {
            id: row.id,
            user_id: row.user_id,
            username: row.user_id
                ? (usernamesById.get(row.user_id) ?? null)
                : null,
            language: row.language,
            created_at: row.created_at,
            history: row.history,
            visible: row.visible,
            children,
        };
    };

    const rootRow = byId.get(rootId);
    return rootRow ? buildNode(rootRow) : null;
}

// loads the fork/branch history for a share as a tree, respecting
// each fork's own visibility
export function useForkTree(shareId: string | null, isOpen: boolean) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tree, setTree] = useState<ForkTreeNode | null>(null);

    const load = useCallback(async () => {
        if (!shareId) {
            setTree(null);
            return;
        }
        setLoading(true);
        setError("");

        try {
            // find the root of this share's tree -- this row is always
            // visible to the caller since they're the one viewing it,
            // so a plain select is fine here
            const { data: selfRow, error: selfErr } = await supabase
                .from("shares")
                .select("id, root_share_id")
                .eq("id", shareId)
                .single();
            if (selfErr || !selfRow)
                throw selfErr ?? new Error("Share not found");
            const rootId: string = selfRow.root_share_id ?? selfRow.id;

            // the rest of the tree needs per-row visibility checks, so it
            // goes through a database function instead of a plain select
            const { data: rows, error: rowsErr } = await supabase.rpc(
                "get_fork_tree_nodes",
                {
                    p_root_id: rootId,
                },
            );
            if (rowsErr) throw rowsErr;

            const allRows = (rows ?? []) as TreeRow[];
            const byId = new Map(allRows.map((r) => [r.id, r]));
            const userIds = [
                ...new Set(
                    allRows
                        .map((r) => r.user_id)
                        .filter((id): id is string => !!id),
                ),
            ];

            // look up usernames for every author appearing in the tree
            const { data: profileRows } = await supabase
                .from("profiles")
                .select("id, username")
                .in(
                    "id",
                    userIds.length
                        ? userIds
                        : ["00000000-0000-0000-0000-000000000000"],
                );
            const usernamesById = new Map(
                (profileRows ?? []).map((p: any) => [p.id, p.username]),
            );

            // group rows by parent so the tree can be built recursively
            const childrenOf = new Map<string, TreeRow[]>();
            allRows.forEach((r) => {
                if (!r.parent_share_id) return;
                if (!childrenOf.has(r.parent_share_id))
                    childrenOf.set(r.parent_share_id, []);
                childrenOf.get(r.parent_share_id)!.push(r);
            });

            const keptIds = computeKeptIds(allRows, childrenOf);
            setTree(
                buildTree(rootId, byId, childrenOf, keptIds, usernamesById),
            );
        } catch (err) {
            console.error("Failed to load fork tree:", err);
            setError("Couldn't load fork history.");
            setTree(null);
        } finally {
            setLoading(false);
        }
    }, [shareId]);

    // reload the tree whenever the panel showing it is opened
    useEffect(() => {
        if (isOpen) load();
    }, [isOpen, load]);

    return { loading, error, tree, reload: load };
}
