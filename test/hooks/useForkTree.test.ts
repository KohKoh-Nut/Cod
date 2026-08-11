import { describe, it, expect, vi } from "vitest";

// useForkTree.ts imports the supabase client at module load time, but
// these tests only exercise its pure tree-building helpers, so stub it
// out rather than needing real supabase env vars in the test run
vi.mock("@/utils/supabase-client", () => ({ supabase: {} }));

import { computeKeptIds, buildTree, TreeRow } from "@/hooks/share/useForkTree";

// small helper to make a row without repeating every field each time
function row(overrides: Partial<TreeRow> & { id: string }): TreeRow {
    return {
        parent_share_id: null,
        user_id: null,
        language: "python",
        created_at: "2026-01-01T00:00:00Z",
        history: null,
        visible: true,
        ...overrides,
    };
}

function childrenMap(rows: TreeRow[]): Map<string, TreeRow[]> {
    const map = new Map<string, TreeRow[]>();
    for (const r of rows) {
        if (!r.parent_share_id) continue;
        if (!map.has(r.parent_share_id)) map.set(r.parent_share_id, []);
        map.get(r.parent_share_id)!.push(r);
    }
    return map;
}

describe("computeKeptIds", () => {
    it("keeps a visible row with no children", () => {
        const rows = [row({ id: "a", visible: true })];
        const kept = computeKeptIds(rows, childrenMap(rows));
        expect(kept.has("a")).toBe(true);
    });

    it("drops a hidden row with no visible descendants", () => {
        const rows = [row({ id: "a", visible: false })];
        const kept = computeKeptIds(rows, childrenMap(rows));
        expect(kept.has("a")).toBe(false);
    });

    it("keeps a hidden row that has a visible descendant", () => {
        // a (hidden) -> b (hidden) -> c (visible)
        // a and b must stay so the branch down to c isn't broken.
        // children need a later created_at than their parent, since the
        // algorithm resolves newest-first
        const rows = [
            row({
                id: "a",
                visible: false,
                created_at: "2026-01-01T00:00:00Z",
            }),
            row({
                id: "b",
                parent_share_id: "a",
                visible: false,
                created_at: "2026-01-02T00:00:00Z",
            }),
            row({
                id: "c",
                parent_share_id: "b",
                visible: true,
                created_at: "2026-01-03T00:00:00Z",
            }),
        ];
        const kept = computeKeptIds(rows, childrenMap(rows));
        expect(kept.has("a")).toBe(true);
        expect(kept.has("b")).toBe(true);
        expect(kept.has("c")).toBe(true);
    });

    it("drops a hidden branch with no visible descendants at all", () => {
        const rows = [
            row({ id: "a", visible: false }),
            row({ id: "b", parent_share_id: "a", visible: false }),
        ];
        const kept = computeKeptIds(rows, childrenMap(rows));
        expect(kept.has("a")).toBe(false);
        expect(kept.has("b")).toBe(false);
    });

    it("keeps a visible sibling but drops a hidden one with no descendants", () => {
        const rows = [
            row({ id: "root", visible: true }),
            row({
                id: "visible-child",
                parent_share_id: "root",
                visible: true,
            }),
            row({
                id: "hidden-child",
                parent_share_id: "root",
                visible: false,
            }),
        ];
        const kept = computeKeptIds(rows, childrenMap(rows));
        expect(kept.has("visible-child")).toBe(true);
        expect(kept.has("hidden-child")).toBe(false);
    });
});

describe("buildTree", () => {
    it("builds a single-node tree for a root with no children", () => {
        const rows = [row({ id: "root", visible: true })];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree).toEqual(
            expect.objectContaining({ id: "root", children: [] }),
        );
    });

    it("nests children under their parent in the built tree", () => {
        const rows = [
            row({ id: "root", visible: true }),
            row({ id: "child", parent_share_id: "root", visible: true }),
        ];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree?.children).toHaveLength(1);
        expect(tree?.children[0].id).toBe("child");
    });

    it("excludes a dropped node from the tree entirely", () => {
        const rows = [
            row({ id: "root", visible: true }),
            row({ id: "dropped", parent_share_id: "root", visible: false }),
        ];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree?.children).toHaveLength(0);
    });

    it("returns null when the root id isn't in the row set", () => {
        const rows = [row({ id: "a", visible: true })];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "missing-root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree).toBeNull();
    });

    it("attaches a username from the lookup map when the row has a user_id", () => {
        const rows = [row({ id: "root", visible: true, user_id: "u1" })];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));
        const usernames = new Map([["u1", "ada"]]);

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            usernames,
        );

        expect(tree?.username).toBe("ada");
    });

    it("leaves username null when the row has no user_id", () => {
        const rows = [row({ id: "root", visible: true, user_id: null })];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree?.username).toBeNull();
    });

    it("builds a multi-level tree preserving grandchildren", () => {
        const rows = [
            row({ id: "root", visible: true }),
            row({ id: "child", parent_share_id: "root", visible: true }),
            row({ id: "grandchild", parent_share_id: "child", visible: true }),
        ];
        const byId = new Map(rows.map((r) => [r.id, r]));
        const kept = computeKeptIds(rows, childrenMap(rows));

        const tree = buildTree(
            "root",
            byId,
            childrenMap(rows),
            kept,
            new Map(),
        );

        expect(tree?.children[0].children[0].id).toBe("grandchild");
    });
});
