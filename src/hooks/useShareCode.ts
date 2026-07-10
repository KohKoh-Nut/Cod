import { useState } from "react";
import { supabase } from "@/utils/supabase-client";

// Tracks who shared a snapshot and when, appended to each share record
export interface ShareHistoryEntry {
    user_id: string;
    email: string | undefined;
    timestamp: string;
}

// Return type for a successful share — includes both the shareable URL and the DB record id
export interface ShareResult {
    url: string;
    id: string;
}

export function useShareCode(
    code: string,
    language: string,
    currentHistory: ShareHistoryEntry[],
) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async (): Promise<ShareResult | "AUTH_REQUIRED" | null> => {
        setIsSharing(true);
        try {
            // Check for an active user session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsSharing(false);
                return "AUTH_REQUIRED";
            }

            const userId = session.user.id;
            const userEmail = session.user.email;
            const timestamp = new Date().toISOString();

            // Create new entry and append it to the existing history array
            const newHistoryEntry: ShareHistoryEntry = {
                user_id: userId,
                email: userEmail,
                timestamp,
            };
            const updatedHistory = [...currentHistory, newHistoryEntry];

            // Save record to Supabase
            const { data, error } = await supabase
                .from("shares")
                .insert([{ code, language, user_id: userId, history: updatedHistory }])
                .select()
                .single();

            if (error) throw error;

            // Generate full share path and return both the URL and the share id
            // The id is used to tag friend-specific share records in share_recipients
            const currentBase = window.location.href.split("#")[0];
            const shareUrl = `${currentBase}#/share/${data.id}`;
            return { url: shareUrl, id: data.id };

        } catch (error) {
            console.error(error);
            alert("Failed to share code.");
            return null;
        } finally {
            setIsSharing(false);
        }
    };

    return { handleShare, isSharing };
}