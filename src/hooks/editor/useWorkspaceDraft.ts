import { useEffect } from "react";
import {
    DRAFT_CODE_KEY,
    DRAFT_LANGUAGE_KEY,
} from "@/hooks/editor/useWorkspaceSync";

// keeps the last edited code and language in localStorage, under the
// same keys useWorkspaceSync restores from, so navigating away from the
// editor and back doesn't lose the draft. Skipped while a read-only
// shared snapshot is being viewed, so someone else's code never gets
// saved as if it were the user's own, and while the workspace is still
// syncing, so a share link or fork draft can't be overwritten mid-restore.
export function useWorkspaceDraft(
    code: string,
    language: string,
    isReadOnly: boolean,
    isInitialLoading: boolean,
) {
    useEffect(() => {
        if (isReadOnly || isInitialLoading) return;
        localStorage.setItem(DRAFT_CODE_KEY, code);
        localStorage.setItem(DRAFT_LANGUAGE_KEY, language);
    }, [code, language, isReadOnly, isInitialLoading]);
}
