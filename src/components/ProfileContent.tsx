'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';
import { useProfile, ProfileVisibility } from '@/hooks/useProfile';
import ShareCard from '@/components/ShareCard';
import Button from '@/components/Button';
import Text from '@/components/Text';

// Available visibility options shown on the owner's profile header
const VISIBILITY_OPTIONS: ProfileVisibility[] = ['public', 'friends', 'private'];

export default function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Username is passed as a query param: /profile/view?username=xxx
  const username = searchParams.get('username') ?? '';
  const [currentUserId, setCurrentUserId] = useState('');

  // Fetch the current session on mount — redirect to login if unauthenticated
  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      setCurrentUserId(sessionData.session.user.id);
    };
    fetchSession();
  }, [router]);

  // useProfile resolves the profile, relationship, visibility gate,
  // public shares, and directional shared-with records
  const {
    profile,
    shares,
    sharedWithRecipient,
    sharedWithMe,
    relation,
    canView,
    isLoading,
    error,
    updateVisibility,
  } = useProfile(username, currentUserId);

  // Delete a share — only available to the profile owner
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting share:', error.message);
  };

  // Guard: no username in query params
  if (!username) return (
    <main className="c-page-layout flex items-center justify-center">
      <Text
        label="No user specified."
        type="description"
        color="muted"
      />
    </main>
  );

  // Guard: still resolving profile and relationship
  if (isLoading) return (
    <main className="c-page-layout flex items-center justify-center">
      <Text
        label="Loading profile..."
        type="description"
        color="muted"
      />
    </main>
  );

  // Guard: user not found or fetch error
  if (error) return (
    <main className="c-page-layout flex items-center justify-center">
      <Text
        label={error}
        type="description"
        color="muted"
      />
    </main>
  );

  // Guard: profile exists but viewer doesn't have access
  if (!canView) return (
    <main className="c-page-layout flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Text
          label={
            profile?.visibility === 'private'
              ? 'This profile is private.'
              : 'This profile is only visible to friends.'
          }
          type="description"
          color="muted"
        />
        <Button
          label="Go Back"
          size="sm"
          onClick={() => router.back()}
        />
      </div>
    </main>
  );

  return (
    <main className="c-page-layout overflow-auto">
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">

        {/* Profile header — shows username, email (friends/owner only), relation badge */}
        <div className="flex items-start justify-between border border-border bg-bg-surface p-6">
          <div className="flex flex-col gap-1">
            <Text
              type="header"
              level={2}
              label={profile?.username ?? ''}
            />

            {/* Email only shown to friends and the owner, not public strangers */}
            {relation !== 'stranger' && (
              <Text
                label={profile?.email ?? ''}
                type="description"
                color="muted"
              />
            )}

            {/* Relation badge — lets the viewer know how they're connected */}
            <span className="text-xs font-mono text-comment mt-1">
              {relation === 'owner' ? 'You' : relation === 'friend' ? 'Friend' : 'Public'}
            </span>
          </div>

          {/* Visibility toggle — only shown to the profile owner */}
          {relation === 'owner' && profile && (
            <div className="flex flex-col gap-2 items-end">
              <Text
                label="Profile visibility"
                type="description"
                color="muted"
              />
              <div className="flex gap-1">
                {VISIBILITY_OPTIONS.map((v) => (
                  <Button
                    key={v}
                    label={v.charAt(0).toUpperCase() + v.slice(1)}
                    size="sm"
                    onClick={() => updateVisibility(v)}
                    // Highlight the currently active visibility option
                    className={profile.visibility === v ? 'border-brand text-brand' : ''}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">

          {/* Public shares section — all shares belonging to this profile */}
          <Text
            type="header"
            level={3}
            label={
              relation === 'owner'
                ? `Your Shares (${shares.length})`
                : `${profile?.username}'s Shares (${shares.length})`
            }
          />

          {shares.length === 0 ? (
            <Text
              label={
                relation === 'owner'
                  ? 'You have no shared snippets yet.'
                  : 'No shared snippets yet.'
              }
              type="description"
              color="muted"
            />
          ) : (
            shares.map((share) => (
              <ShareCard
                key={share.id}
                share={share}
                isOwner={relation === 'owner'}
                onDelete={relation === 'owner' ? handleDelete : undefined}
              />
            ))
          )}

          {/* Shares sent by me to this person — visible when viewing a friend's profile */}
          {sharedWithRecipient.length > 0 && (
            <div className="flex flex-col gap-3">
              <Text
                type="header"
                level={3}
                label={`Code Shared with ${profile?.username} (${sharedWithRecipient.length})`}
              />
              {sharedWithRecipient.map((share) => (
                <ShareCard
                  key={share.id}
                  share={share}
                  isOwner={true}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Shares sent to me by this person — visible when viewing a friend's profile */}
          {sharedWithMe.length > 0 && (
            <div className="flex flex-col gap-3">
              <Text
                type="header"
                level={3}
                label={`Code Shared with Me (${sharedWithMe.length})`}
              />
              {sharedWithMe.map((share) => (
                <ShareCard
                  key={share.id}
                  share={share}
                  isOwner={false}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}