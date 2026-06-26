"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ShareHistoryEntry } from "@/hooks/useShareCode";
import { supabase } from "@/utils/supabase-client";

interface UserShareItem {
    id: string;
    language: string;
    code: string;
    created_at: string;
    history: ShareHistoryEntry[] | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [myShares, setMyShares] = useState<UserShareItem[]>([]);

    useEffect(() => {
        const fetchUserDataAndShares = async () => {
            // Check active session user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            try {
                // Fetch custom username from public profiles table
                const { data: profileData, error: profileError } =
                    await supabase
                        .from("profiles")
                        .select("username")
                        .eq("id", user.id)
                        .maybeSingle();

                if (!profileError && profileData && profileData.username) {
                    setUsername(profileData.username);
                } else {
                    // Fallback placeholder if anything fails
                    setUsername(user.email?.split("@")[0] || "Developer");
                }

                // Fetch shared snippets belonging to the user
                const { data, error } = await supabase
                    .from("shares")
                    .select("id, language, code, created_at, history")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (data) setMyShares(data as UserShareItem[]);
            } catch (err) {
                console.error("Error pulling history profiles:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAndShares();
    }, [router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-fg font-mono rounded-none">
                Loading Profile Workspace Matrix...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-bg text-fg p-6 max-w-4xl mx-auto w-full font-mono rounded-none">
            {/* Profile Header */}
            <header className="flex justify-between items-center border-b border-border pb-6 mb-6 rounded-none">
                <div>
                    <h1 className="text-3xl font-bold text-fg tracking-tight">
                        Welcome, {username}
                    </h1>
                    <p className="text-fg-muted text-sm mt-1">
                        Review your shared links and repository tree snapshots.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-error hover:bg-brand-hover text-bg font-bold transition duration-200 ease-in-out text-sm rounded-none cursor-pointer"
                >
                    Log Out
                </button>
            </header>

            {/* Shared Code Snippets List */}
            <section className="flex flex-col gap-4 rounded-none">
                <h2 className="text-xl font-semibold text-fg">
                    Your Shared Code Modules ({myShares.length})
                </h2>

                {myShares.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-border rounded-none text-fg-muted bg-bg-surface">
                        {
                            "You haven't shared any code snippets yet. Go back to the IDE canvas and click share!"
                        }
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 rounded-none">
                        {myShares.map((item) => {
                            const totalLines = item.code.split("\n").length;
                            const previewSnippet =
                                item.code.slice(0, 80) +
                                (item.code.length > 80 ? "..." : "");
                            const sharedLinkAddress = `./#/share/${item.id}`;

                            return (
                                <a
                                    key={item.id}
                                    href={sharedLinkAddress}
                                    className="block p-4 border border-border rounded-none bg-bg-surface hover:bg-crushed-clay hover:border-comment transition duration-200 ease-in-out group"
                                >
                                    <div className="flex justify-between items-start mb-2 rounded-none">
                                        <div className="flex items-center gap-3 rounded-none">
                                            <span className="px-2 py-0.5 bg-bg-element text-interactive font-mono text-xs rounded-none uppercase border border-border">
                                                {item.language}
                                            </span>
                                            <span className="text-xs text-fg-muted">
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-fg-muted group-hover:text-brand transition duration-200 ease-in-out flex items-center gap-1">
                                            Open in IDE &rarr;
                                        </span>
                                    </div>

                                    {/* Code Preview Block */}
                                    <p className="font-mono text-xs text-river-silt bg-abyssal-bark p-2 rounded-none border border-border whitespace-pre overflow-hidden text-ellipsis">
                                        {previewSnippet || "empty snapshot..."}
                                    </p>

                                    <div className="mt-2 flex gap-4 text-[11px] text-fg-muted rounded-none">
                                        <span>Lines: {totalLines}</span>
                                        <span>
                                            Forks/Revisions:{" "}
                                            {item.history
                                                ? item.history.length
                                                : 1}
                                        </span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
