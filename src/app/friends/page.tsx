"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { useFriends, UserProfile } from "@/hooks/friends/useFriends";
import { useFriendGraph } from "@/hooks/friends/useFriendGraph";
import FriendGraph from "@/components/friends/FriendGraph";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

// short date shown for how long a friendship has existed
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// loads the current user first, so the friends page never renders
// without knowing who's viewing it
export default function FriendsPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.push("/login");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("id, username")
                .eq("id", sessionData.session.user.id)
                .single();

            if (data) setCurrentUser(data as UserProfile);
        };
        fetchUser();
    }, [router]);

    if (!currentUser)
        return (
            <main className="c-page-layout flex items-center justify-center">
                <Text label="Loading..." type="description" />
            </main>
        );

    return <FriendsContent currentUser={currentUser} />;
}

// the actual friends page content: search, pending requests, and a
// list/graph toggle for viewing your existing friends
function FriendsContent({ currentUser }: { currentUser: UserProfile }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"list" | "graph">("list");

    const {
        friends,
        pendingRequests,
        sentRequests,
        searchResults,
        isLoading,
        error,
        searchUsers,
        sendRequest,
        acceptRequest,
        declineRequest,
        removeFriend,
    } = useFriends(currentUser.id);

    const graphData = useFriendGraph(currentUser, friends);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        searchUsers(e.target.value);
    };

    const isAlreadyFriend = (userId: string) =>
        friends.some((f) => f.friend_id === userId);

    // used to hide the "Add" button for someone already requested
    const isRequestSent = (userId: string) =>
        sentRequests.some((r) => r.receiver_id === userId);

    return (
        <main className="c-page-layout overflow-auto">
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <Text type="header" level={2} label="Friends" />

                <div className="flex flex-col gap-2">
                    <Text type="description" label="Search by username" />
                    <Input
                        label="Search"
                        type="text"
                        placeholder="Enter username..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    {/* live search results as the user types */}
                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-2 border border-border bg-bg-surface p-3">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between py-1"
                                >
                                    <Text
                                        label={user.username}
                                        type="description"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            label="View"
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/profile/view?username=${user.username}`,
                                                )
                                            }
                                        />
                                        {isAlreadyFriend(user.id) ? (
                                            <Text
                                                label="Already friends"
                                                type="description"
                                                color="muted"
                                            />
                                        ) : isRequestSent(user.id) ? (
                                            <Text
                                                label="Request sent"
                                                type="description"
                                                color="muted"
                                            />
                                        ) : (
                                            <Button
                                                label="Add"
                                                size="sm"
                                                onClick={() =>
                                                    sendRequest(user.id)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <Text
                            label="Searching..."
                            type="description"
                            color="muted"
                        />
                    )}

                    {/* only shown once a search has actually returned nothing */}
                    {searchQuery &&
                        !isLoading &&
                        searchResults.length === 0 && (
                            <Text
                                label="No users found"
                                type="description"
                                color="muted"
                            />
                        )}
                </div>

                {/* incoming friend requests waiting on accept/decline */}
                {pendingRequests.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <Text
                            type="header"
                            level={3}
                            label="Pending Requests"
                        />
                        {pendingRequests.map((req) => (
                            <div
                                key={req.id}
                                className="flex items-center justify-between border border-border bg-bg-surface p-3"
                            >
                                <Text
                                    label={req.sender.username}
                                    type="description"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        label="Accept"
                                        size="sm"
                                        onClick={() => acceptRequest(req.id)}
                                    />
                                    <Button
                                        label="Decline"
                                        size="sm"
                                        onClick={() => declineRequest(req.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <Text label={error} type="description" color="muted" />
                )}

                <div className="flex gap-2">
                    <Button
                        label="List"
                        size="sm"
                        onClick={() => setActiveTab("list")}
                        className={activeTab === "list" ? "border-brand" : ""}
                    />
                    <Button
                        label="Graph"
                        size="sm"
                        onClick={() => setActiveTab("graph")}
                        className={activeTab === "graph" ? "border-brand" : ""}
                    />
                </div>

                {/* friends shown as a simple list */}
                {activeTab === "list" && (
                    <div className="flex flex-col gap-2">
                        <Text
                            type="header"
                            level={3}
                            label={`Friends (${friends.length})`}
                        />
                        {friends.length === 0 ? (
                            <Text
                                label="No friends yet — search for someone above."
                                type="description"
                                color="muted"
                            />
                        ) : (
                            friends.map((f) => (
                                <div
                                    key={f.id}
                                    className="flex items-center justify-between border border-border bg-bg-surface p-3"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <Text
                                            label={f.friend.username}
                                            type="description"
                                        />
                                        <Text
                                            label={`Friends since ${formatDate(f.created_at)}`}
                                            type="description"
                                            color="muted"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            label="View"
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/profile/view?username=${f.friend.username}`,
                                                )
                                            }
                                        />
                                        <Button
                                            label="Remove"
                                            size="sm"
                                            onClick={() =>
                                                removeFriend(f.friend_id)
                                            }
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* friends shown as a connection graph */}
                {activeTab === "graph" && (
                    <div className="flex flex-col gap-2">
                        <Text
                            type="header"
                            level={3}
                            label="Connection Graph"
                        />
                        <div
                            className="border border-border bg-bg-surface w-full"
                            style={{ height: "500px" }}
                        >
                            {friends.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <Text
                                        label="Add friends to see your connection graph."
                                        type="description"
                                        color="muted"
                                    />
                                </div>
                            ) : (
                                <FriendGraph data={graphData} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
