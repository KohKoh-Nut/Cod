import { useState } from "react";
import { supabase } from "@/utils/supabase-client";
import { useDialog } from "@/hooks/ui/useDialog";
import { ShareVisibility } from "@/types/share";

// one entry in a share's history, recording who shared it and when
export interface ShareHistoryEntry {
    user_id: string;
    email: string | undefined;
    timestamp: string;
}

export interface ShareResult {
    url: string;
    id: string;
}

export function useShareCode(
    code: string,
    language: string,
    currentHistory: ShareHistoryEntry[],
    // set when sharing a fork, so the new share links back to its parent
    parentShareId: string | null = null,
) {
    const [isSharing, setIsSharing] = useState(false);
    const { alert } = useDialog();

    // saves the code as a new share row, grants friend access if needed,
    // and returns the shareable url
    const createShare = async (
        visibility: ShareVisibility,
        friendIds: string[],
    ): Promise<ShareResult | "AUTH_REQUIRED" | null> => {
        setIsSharing(true);
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                setIsSharing(false);
                return "AUTH_REQUIRED";
            }

            const userId = session.user.id;
            const userEmail = session.user.email;
            const timestamp = new Date().toISOString();

            // append this share event to the running history
            const newHistoryEntry: ShareHistoryEntry = {
                user_id: userId,
                email: userEmail,
                timestamp,
            };
            const updatedHistory = [...currentHistory, newHistoryEntry];

            const { data, error } = await supabase
                .from("shares")
                .insert([
                    {
                        code,
                        language,
                        user_id: userId,
                        history: updatedHistory,
                        parent_share_id: parentShareId,
                        visibility,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            // for friends-only shares, explicitly grant each selected friend access
            if (visibility === "friends" && friendIds.length > 0) {
                const { error: recError } = await supabase
                    .from("share_recipients")
                    .insert(
                        friendIds.map((recipientId) => ({
                            share_id: data.id,
                            sender_id: userId,
                            recipient_id: recipientId,
                        })),
                    );

                // code 23505 is a unique-constraint violation (already granted),
                // safe to ignore -- anything else gets logged
                if (recError && recError.code !== "23505") {
                    console.error(
                        "Error granting friend access:",
                        recError.message,
                    );
                }
            }

            // build the hash-based share link relative to the current page
            const currentBase = window.location.href.split("#")[0];
            return { url: `${currentBase}#/share/${data.id}`, id: data.id };
        } catch (error) {
            console.error(error);
            await alert("Failed to share code.");
            return null;
        } finally {
            setIsSharing(false);
        }
    };

    return { createShare, isSharing };
}
