"use client";

import { useProfileData } from "@/hooks/useProfileData";
import { ShareCard } from "@/components/profile/ShareCard";

export default function ProfilePage() {
    const { loading, username, myShares, handleLogout, handleDelete } =
        useProfileData();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-fg font-mono rounded-none">
                Loading Profile Workspace Matrix...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-bg text-fg p-6 max-w-4xl mx-auto w-full font-mono rounded-none">
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
        </div>
    );
}
