import { useMemo } from "react";
import { Friend, UserProfile } from "./useFriends";

export interface GraphNode {
    id: string;
    username: string;
    initials: string;
    isCurrentUser: boolean;
    // how many edges touch this node -- used to size it, so someone
    // you share more connections with reads as a bigger, more central node
    connections: number;
}

export interface GraphEdge {
    source: string;
    target: string;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

// turns a username into up to 2 letters for the graph node avatar
function getInitials(username: string): string {
    return username
        .split(/[\s_\-\.]+/)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");
}

export function useFriendGraph(
    currentUser: UserProfile,
    friends: Friend[],
): GraphData {
    // builds a node/edge list centered on the current user, for the
    // friend graph visualization
    return useMemo(() => {
        // current user is always the center node
        const nodeMap = new Map<string, Omit<GraphNode, "connections">>();

        nodeMap.set(currentUser.id, {
            id: currentUser.id,
            username: currentUser.username,
            initials: getInitials(currentUser.username),
            isCurrentUser: true,
        });

        const edges: GraphEdge[] = [];

        friends.forEach((f) => {
            // only add a node for this friend if we haven't seen them yet
            if (!nodeMap.has(f.friend_id)) {
                nodeMap.set(f.friend_id, {
                    id: f.friend_id,
                    username: f.friend.username,
                    initials: getInitials(f.friend.username),
                    isCurrentUser: false,
                });
            }

            // connect current user to this friend
            edges.push({
                source: currentUser.id,
                target: f.friend_id,
            });
        });

        // count how many edges touch each node, so nodes with more shared
        // connections render bigger
        const degree = new Map<string, number>();
        edges.forEach((e) => {
            degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
            degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
        });

        const nodes = Array.from(nodeMap.values()).map((n) => ({
            ...n,
            connections: degree.get(n.id) ?? 0,
        }));

        return { nodes, edges };
    }, [currentUser, friends]);
}
