import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase-client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender: UserProfile;
  receiver: UserProfile;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend: UserProfile;
}

export function useFriends(currentUserId: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFriends = useCallback(async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        created_at,
        friend:profiles!friends_friend_id_fkey (
          id, username, email
        )
      `)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching friends:', error.message);
      return;
    }
    setFriends((data as unknown as Friend[]) ?? []);
  }, [currentUserId]);

  const fetchPendingRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey (
          id, username, email
        )
      `)
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching requests:', error.message);
      return;
    }
    setPendingRequests((data as unknown as FriendRequest[]) ?? []);
  }, [currentUserId]);

  const fetchSentRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at')
      .eq('sender_id', currentUserId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching sent requests:', error.message);
      return;
    }
    setSentRequests((data as FriendRequest[]) ?? []);
  }, [currentUserId]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email')
      .ilike('username', `%${query}%`)
      .neq('id', currentUserId)
      .limit(10);
    if (error) console.error('Error searching users:', error.message);
    setSearchResults((data as UserProfile[]) ?? []);
    setIsLoading(false);
  };

  const sendRequest = async (receiverId: string) => {
    setError('');
    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: currentUserId, receiver_id: receiverId });
    if (error) {
      console.error('Error sending request:', error.message);
      setError(error.message);
      return false;
    }
    await fetchSentRequests();
    return true;
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (error) {
      console.error('Error accepting request:', error.message);
      setError(error.message);
      return false;
    }
    await fetchPendingRequests();
    await fetchFriends();
    return true;
  };

  const declineRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);
    if (error) {
      console.error('Error declining request:', error.message);
      setError(error.message);
      return false;
    }
    await fetchPendingRequests();
    return true;
  };

  const removeFriend = async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`);
    if (error) {
      console.error('Error removing friend:', error.message);
      setError(error.message);
      return false;
    }
    await fetchFriends();
    return true;
  };

  useEffect(() => {
    if (!currentUserId) return;
    fetchFriends();
    fetchPendingRequests();
    fetchSentRequests();
  }, [currentUserId, fetchFriends, fetchPendingRequests, fetchSentRequests]);

  return {
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
    refetch: () => {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
    },
  };
}