import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase-client";
import { ShareHistoryEntry } from "@/hooks/share/useShareCode";
import { ShareVisibility } from "@/types/share";

// localStorage keys used to stage a forked draft before it's loaded
const FORK_STORAGE_KEYS = [
    "forked_code",
    "forked_lang",
    "forked_from_id",
    "forked_history",
    "forked_visibility",
    "forked_recipient_ids",
];

function clearForkStorage() {
    FORK_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

// looks up everyone a friends-only share was sent to, using a database
// function since a plain select would only return the caller's own row
async function fetchRecipientIds(shareId: string) {
    const { data, error } = await supabase.rpc("get_share_recipient_ids", {
        p_share_id: shareId,
    });
    if (error) {
        console.error("Failed to fetch share recipients:", error.message);
        return [];
    }
    return (data ?? []) as string[];
}

// on mount, restores the editor from either a shared link in the url
// hash or a leftover forked draft in localStorage, and tracks all the
// state needed to save/share the current code correctly
export function useWorkspaceSync(
    setCode: (code: string) => void,
    setLanguage: (language: string) => void,
) {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [currentHistory, setCurrentHistory] = useState<ShareHistoryEntry[]>(
        [],
    );

    // currentShareId: the share currently loaded in read-only mode, if any
    // parentShareId: set when this code came from a fork that hasn't been
    // re-shared yet, so the next share can record where it forked from
    const [currentShareId, setCurrentShareId] = useState<string | null>(null);
    const [parentShareId, setParentShareId] = useState<string | null>(null);

    // defaults for the next share's visibility/friend picker: "public" for
    // fresh code, or whatever the forked-from code was already set to
    const [defaultVisibility, setDefaultVisibility] =
        useState<ShareVisibility>("public");
    const [defaultFriendIds, setDefaultFriendIds] = useState<string[]>([]);

    useEffect(() => {
        // loads a share by id from a "#/share/:id" hash and switches
        // the editor into read-only mode
        const loadFromShareHash = async (shareId: string) => {
            const { data, error } = await supabase
                .from("shares")
                .select("*")
                .eq("id", shareId)
                .single();
            if (error || !data) {
                // an empty result means either the share doesn't exist or
                // the viewer isn't allowed to see it -- both look the same
                // from here, so both are treated as access denied
                setAccessDenied(true);
                setIsInitialLoading(false);
                return true;
            }

            // this share load takes priority, so drop any stale fork draft
            clearForkStorage();

            const recipientIds =
                data.visibility === "friends"
                    ? await fetchRecipientIds(data.id)
                    : [];
            // preselect the share's owner plus its other recipients as
            // friend candidates, in case this share gets forked and re-shared
            const friendCandidates =
                data.visibility === "friends"
                    ? [...new Set([data.user_id, ...recipientIds])]
                    : [];

            setLanguage(data.language);

            // small delay lets the language switch settle before the
            // code itself is applied
            setTimeout(() => {
                setCode(data.code);
                setCurrentHistory((data.history as ShareHistoryEntry[]) || []);
                setCurrentShareId(data.id);
                setDefaultVisibility(data.visibility as ShareVisibility);
                setDefaultFriendIds(friendCandidates);
                setIsReadOnly(true);
                setIsInitialLoading(false);
            }, 150);
            return true;
        };

        // loads a pending fork draft that was staged in localStorage
        // (e.g. by the "fork this share" action) before this page loaded
        const loadFromForkedDraft = () => {
            const forkedCode = localStorage.getItem("forked_code");
            const forkedLang = localStorage.getItem("forked_lang");
            if (!forkedCode || !forkedLang) return false;

            const forkedFromId = localStorage.getItem("forked_from_id");
            const forkedHistoryRaw = localStorage.getItem("forked_history");
            const forkedVisibility = localStorage.getItem(
                "forked_visibility",
            ) as ShareVisibility | null;
            const forkedRecipientIdsRaw = localStorage.getItem(
                "forked_recipient_ids",
            );

            setLanguage(forkedLang);
            setTimeout(() => {
                setCode(forkedCode);
                if (forkedHistoryRaw) {
                    try {
                        setCurrentHistory(JSON.parse(forkedHistoryRaw));
                    } catch (err) {
                        console.error("Bad forked history payload:", err);
                    }
                }
                setParentShareId(forkedFromId || null);
                setDefaultVisibility(forkedVisibility ?? "public");
                if (forkedRecipientIdsRaw) {
                    try {
                        setDefaultFriendIds(JSON.parse(forkedRecipientIdsRaw));
                    } catch (err) {
                        console.error("Bad forked recipients payload:", err);
                    }
                }
                clearForkStorage();
                setIsInitialLoading(false);
            }, 100);
            return true;
        };

        // shared link always wins over a leftover fork draft; if a fork
        // draft never got cleaned up it shouldn't be able to permanently
        // block future share links from loading
        const sync = async () => {
            const hash = window.location.hash;
            if (hash.startsWith("#/share/")) {
                const shareId = hash.replace("#/share/", "");
                window.location.hash = "";
                if (shareId && (await loadFromShareHash(shareId))) return;
            }

            if (loadFromForkedDraft()) return;

            setIsInitialLoading(false);
        };

        sync();
    }, [setCode, setLanguage]);

    return {
        isInitialLoading,
        isReadOnly,
        setIsReadOnly,
        accessDenied,
        currentHistory,
        setCurrentHistory,
        currentShareId,
        setCurrentShareId,
        parentShareId,
        setParentShareId,
        defaultVisibility,
        setDefaultVisibility,
        defaultFriendIds,
        setDefaultFriendIds,
    };
}
