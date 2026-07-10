import { useState } from 'react';
import { supabase } from '@/utils/supabase-client';

export interface FriendOption {
  id: string;
  username: string;
}

export function useShareWithFriend(currentUserId: string) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');

  const shareWithFriend = async (
    shareId: string,
    recipientId: string,
  ): Promise<boolean> => {
    setIsSharing(true);
    setError('');

    const { error } = await supabase
      .from('share_recipients')
      .insert({
        share_id: shareId,
        sender_id: currentUserId,
        recipient_id: recipientId,
      });

    setIsSharing(false);

    if (error) {
      // Ignore duplicate — already shared with this person
      if (error.code === '23505') return true;
      console.error('Error sharing with friend:', error.message);
      setError(error.message);
      return false;
    }

    return true;
  };

  const revokeShare = async (
    shareId: string,
    recipientId: string,
  ): Promise<boolean> => {
    setIsSharing(true);
    setError('');

    const { error } = await supabase
      .from('share_recipients')
      .delete()
      .eq('share_id', shareId)
      .eq('recipient_id', recipientId)
      .eq('sender_id', currentUserId);

    setIsSharing(false);

    if (error) {
      console.error('Error revoking share:', error.message);
      setError(error.message);
      return false;
    }

    return true;
  };

  const fetchFriends = async (): Promise<FriendOption[]> => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend:profiles!friends_friend_id_fkey (
          id, username
        )
      `)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching friends:', error.message);
      return [];
    }

    return (data ?? []).map((d: any) => ({
      id: d.friend.id,
      username: d.friend.username,
    }));
  };

  return {
    isSharing,
    error,
    shareWithFriend,
    revokeShare,
    fetchFriends,
  };
}