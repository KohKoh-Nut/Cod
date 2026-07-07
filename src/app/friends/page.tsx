'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';
import { useFriends, UserProfile } from '@/hooks/useFriends';
import { useFriendGraph } from '@/hooks/useFriendGraph';
import FriendGraph from '@/components/FriendGraph';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Text from '@/components/Text';

export default function FriendsPage() {
  console.log('FriendsPage mounted');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect fired');
    const fetchUser = async () => {
      console.log('fetchUser called');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session user id:', sessionData.session?.user?.id); // debug
      if (!sessionData.session) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, email')
        .eq('id', sessionData.session.user.id)
        .single();

      if (data) setCurrentUser(data as UserProfile);
    };
    fetchUser();
  }, []);

  if (!currentUser) return (
    <main className="c-page-layout flex items-center justify-center">
      <Text label="Loading..." type="description" />
    </main>
  );

  // Only render FriendsContent once currentUser is confirmed
  return <FriendsContent currentUser={currentUser} />;
}

// Separate component — useFriends only called when currentUser is real
function FriendsContent({ currentUser }: { currentUser: UserProfile }) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');

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

  const isRequestSent = (userId: string) =>
    sentRequests.some((r) => r.receiver_id === userId);

  if (!currentUser) return (
    <main className="c-page-layout flex items-center justify-center">
      <Text label="Loading..." type="description" />
    </main>
  );

  return (
    <main className="c-page-layout overflow-auto">
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">

        {/* Header */}
        <Text type="header" level={2} label="Friends" />

        {/* Search */}
        <div className="flex flex-col gap-2">
          <Text type="description" label="Search by username" />
          <Input
            label="Search"
            type="text"
            placeholder="Enter username..."
            value={searchQuery}
            onChange={handleSearch}
          />

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 border border-border rounded-none bg-bg-surface p-3">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-1"
                >
                  <Text label={user.username} type="description" />
                  {isAlreadyFriend(user.id) ? (
                    <Text label="Already friends" type="description" color="muted" />
                  ) : isRequestSent(user.id) ? (
                    <Text label="Request sent" type="description" color="muted" />
                  ) : (
                    <Button
                      label="Add"
                      size="sm"
                      onClick={() => sendRequest(user.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && <Text label="Searching..." type="description" color="muted" />}
          {searchQuery && !isLoading && searchResults.length === 0 && (
            <Text label="No users found" type="description" color="muted" />
          )}
        </div>

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div className="flex flex-col gap-2">
            <Text type="header" level={3} label="Pending Requests" />
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between border border-border bg-bg-surface p-3"
              >
                <Text label={req.sender.username} type="description" />
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

        {error && <Text label={error} type="description" color="muted" />}

        {/* Tab toggle */}
        <div className="flex gap-2">
          <Button
            label="List"
            size="sm"
            onClick={() => setActiveTab('list')}
            className={activeTab === 'list' ? 'border-brand' : ''}
          />
          <Button
            label="Graph"
            size="sm"
            onClick={() => setActiveTab('graph')}
            className={activeTab === 'graph' ? 'border-brand' : ''}
          />
        </div>

        {/* Friends list */}
        {activeTab === 'list' && (
          <div className="flex flex-col gap-2">
            <Text type="header" level={3} label={`Friends (${friends.length})`} />
            {friends.length === 0 ? (
              <Text label="No friends yet — search for someone above." type="description" color="muted" />
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border border-border bg-bg-surface p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <Text label={f.friend.username} type="description" />
                    <Text label={f.friend.email} type="description" color="muted" />
                  </div>
                  <Button
                    label="Remove"
                    size="sm"
                    onClick={() => removeFriend(f.friend_id)}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Graph view */}
        {activeTab === 'graph' && (
          <div className="flex flex-col gap-2">
            <Text type="header" level={3} label="Connection Graph" />
            <div className="border border-border bg-bg-surface w-full" style={{ height: '500px' }}>
              {friends.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Text label="Add friends to see your connection graph." type="description" color="muted" />
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