import { useMemo } from 'react';
import { Friend, UserProfile } from './useFriends';

export interface GraphNode {
  id: string;
  username: string;
  initials: string;
  isCurrentUser: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function getInitials(username: string): string {
  return username
    .split(/[\s_\-\.]+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export function useFriendGraph(
  currentUser: UserProfile,
  friends: Friend[],
): GraphData {
  return useMemo(() => {
    // Always start with the current user as the center node
    const nodeMap = new Map<string, GraphNode>();

    nodeMap.set(currentUser.id, {
      id: currentUser.id,
      username: currentUser.username,
      initials: getInitials(currentUser.username),
      isCurrentUser: true,
    });

    const edges: GraphEdge[] = [];

    friends.forEach((f) => {
      // Add friend as a node if not already present
      if (!nodeMap.has(f.friend_id)) {
        nodeMap.set(f.friend_id, {
          id: f.friend_id,
          username: f.friend.username,
          initials: getInitials(f.friend.username),
          isCurrentUser: false,
        });
      }

      // Add edge between current user and friend
      edges.push({
        source: currentUser.id,
        target: f.friend_id,
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges,
    };
  }, [currentUser, friends]);
}