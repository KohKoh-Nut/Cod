import { ShareHistoryEntry } from "@/hooks/share/useShareCode";

// controls who can view a shared snippet
export type ShareVisibility = "public" | "friends" | "private";

// a saved code snippet, as stored in the shares table
export interface Share {
    id: string;
    code: string;
    language: string;
    created_at: string;
    user_id: string;
    visibility: ShareVisibility;
    history?: ShareHistoryEntry[] | null;
}
