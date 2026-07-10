"use client";

import { useProfileData } from "@/hooks/useProfileData";
import { ShareCard } from "@/components/profile/ShareCard";

export default function ProfilePage() {
    const { 
        loading, 
        username, 
        visibility, 
        myShares, 
        sharedWithMe,
        sharedWithOthers, 
        handleDelete 
    } = useProfileData();

    // Show loading state while fetching profile and shares
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-fg font-mono rounded-none">
                Loading Profile Workspace Matrix...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-bg text-fg p-6 max-w-4xl mx-auto w-full font-mono rounded-none">

            {/* Profile header — shows username and current visibility badge */}
            <header className="flex justify-between items-center border-b border-border pb-6 mb-6 rounded-none">
                <div>
                    <h1 className="text-3xl font-bold text-fg tracking-tight">
                        Welcome, {username}
                    </h1>
                    <p className="text-fg-muted text-sm mt-1">
                        Review your shared links and repository tree snapshots.
                    </p>
                </div>

                {/* Read-only visibility badge — change visibility in Settings */}
                <span className="text-xs font-mono px-2 py-1 border border-border text-comment bg-bg-element">
                    {visibility === 'public' ? '🌐 Public' : visibility === 'friends' ? '👥 Friends' : '🔒 Private'}
                </span>
            </header>

            {/* Your own shares */}
            <section className="flex flex-col gap-4 rounded-none mb-8">
                <h2 className="text-xl font-semibold text-fg">
                    Your Shared Code Modules ({myShares.length})
                </h2>
                {myShares.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-border rounded-none text-fg-muted bg-bg-surface">
                        {"You haven't shared any code snippets yet. Go back to the IDE canvas and click share!"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 rounded-none">
                        {myShares.map((item) => (
                            <ShareCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Code shared with me, grouped by sender — one section per friend */}
            {Object.entries(sharedWithMe).map(([senderId, { username: senderName, shares }]) => (
                <section key={senderId} className="flex flex-col gap-4 rounded-none mb-8">
                    <h2 className="text-xl font-semibold text-fg">
                        Code Shared with Me by {senderName} ({shares.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-3 rounded-none">
                        {shares.map((item) => (
                            <ShareCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {/* Code I have sent to others, grouped by recipient */}
            {Object.entries(sharedWithOthers).map(([recipientId, { username: recipientName, shares }]) => (
                <section key={recipientId} className="flex flex-col gap-4 rounded-none mb-8">
                    <h2 className="text-xl font-semibold text-fg">
                        Code Shared with {recipientName} ({shares.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-3 rounded-none">
                        {shares.map((item) => (
                            <ShareCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            ))}

        </div>
    );
}