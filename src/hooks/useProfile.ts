import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase-client';

// Controls who can view a profile page
export type ProfileVisibility = 'public' | 'friends' | 'private';

// Full profile record from the profiles table
export interface Profile {
  id: string;
  username: string;
  email: string;
  visibility: ProfileVisibility;
}

// A single shared code snapshot from the shares table
export interface Share {
  id: string;
  code: string;
  language: string;
  created_at: string;
  user_id: string;
}

// Describes the current viewer's relationship to the profile being viewed
export type ViewerRelation = 'owner' | 'friend' | 'stranger';

export function useProfile(username: string, currentUserId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);

  // All public shares belonging to the profile owner
  const [shares, setShares] = useState<Share[]>([]);

  // Shares the current user has sent to this profile (shown on friend's profile)
  const [sharedWithRecipient, setSharedWithRecipient] = useState<Share[]>([]);

  // Shares this profile owner has sent to the current user (shown as "Shared with Me")
  const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);
  const [relation, setRelation] = useState<ViewerRelation>('stranger');
  const [canView, setCanView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch whenever the target username or current user changes
  useEffect(() => {
    if (!username || !currentUserId) return;
    fetchProfile();
  }, [username, currentUserId]);

  // Fetch all public shares for a given user, ordered newest first
  const fetchShares = async (userId: string) => {
    const { data, error } = await supabase
      .from('shares')
      .select('id, code, language, created_at, user_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching shares:', error.message); return; }
    setShares((data as Share[]) ?? []);
  };

  // Fetch shares the current user has explicitly sent to this profile
  const fetchSharedWithRecipient = async (recipientId: string) => {
    const { data, error } = await supabase
      .from('share_recipients')
      .select(`share:shares!share_recipients_share_id_fkey (id, code, language, created_at, user_id)`)
      .eq('sender_id', currentUserId)
      .eq('recipient_id', recipientId);
    if (error) { console.error('Error fetching shared with recipient:', error.message); return []; }
    return (data ?? []).map((d: any) => d.share as Share);
  };

  // Fetch shares this profile owner has sent specifically to the current user
  const fetchSharedWithMe = async (senderId: string) => {
    const { data, error } = await supabase
      .from('share_recipients')
      .select(`share:shares!share_recipients_share_id_fkey (id, code, language, created_at, user_id)`)
      .eq('sender_id', senderId)
      .eq('recipient_id', currentUserId);
    if (error) { console.error('Error fetching shared with me:', error.message); return []; }
    return (data ?? []).map((d: any) => d.share as Share);
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');

    // Look up the profile by username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, visibility')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      setError('User not found.');
      setIsLoading(false);
      return;
    }

    const profile = profileData as Profile;
    setProfile(profile);

    // Owner always has full access to their own profile
    if (profile.id === currentUserId) {
      setRelation('owner');
      setCanView(true);
      await fetchShares(profile.id);
      setIsLoading(false);
      return;
    }

    // Check if the current user and profile owner are friends
    const { data: friendData } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('friend_id', profile.id)
      .maybeSingle();

    const isFriend = !!friendData;
    setRelation(isFriend ? 'friend' : 'stranger');

    // Determine access based on profile visibility setting
    const allowed =
      profile.visibility === 'public' ||
      (profile.visibility === 'friends' && isFriend);

    setCanView(allowed);

    if (allowed) {
      // Load all content visible to this viewer
      await fetchShares(profile.id);

      // Load directional share records between the two users
      const sent = await fetchSharedWithRecipient(profile.id);
      setSharedWithRecipient(sent);

      const received = await fetchSharedWithMe(profile.id);
      setSharedWithMe(received);
    }

    setIsLoading(false);
  };

  // Allows the profile owner to update their visibility setting
  const updateVisibility = async (visibility: ProfileVisibility) => {
    const { error } = await supabase
      .from('profiles')
      .update({ visibility })
      .eq('id', currentUserId);
    if (error) { console.error('Error updating visibility:', error.message); return false; }

    // Optimistically update local state without refetching
    setProfile((prev) => prev ? { ...prev, visibility } : prev);
    return true;
  };

  return {
    profile, 
    shares, 
    sharedWithRecipient, 
    sharedWithMe,
    relation, 
    canView, 
    isLoading, 
    error, 
    updateVisibility,
  };
}