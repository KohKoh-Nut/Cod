"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
    GraphData,
    GraphNode,
    GraphEdge,
} from "@/hooks/friends/useFriendGraph";

interface FriendGraphProps {
    data: GraphData;
}

// GraphNode plus the position/velocity fields d3-force attaches at runtime
type SimNode = GraphNode & Partial<d3.SimulationNodeDatum>;

// node radius grows with how many shared connections it has, so more
// connected people stand out -- current user gets a flat bonus on top
// since they're always the hub of this graph
function nodeRadius(d: GraphNode): number {
    const base = d.isCurrentUser ? 26 : 18;
    return base + Math.sqrt(d.connections) * 3;
}

// force-directed graph of the current user and their friends, drawn
// with d3 directly onto an svg ref (not through react's render cycle).
// Tuned to feel closer to Obsidian's graph view: nodes drift into place
// smoothly instead of snapping, and hold their position across re-renders.
export default function FriendGraph({ data }: FriendGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    // remembers where each node last settled, keyed by id, so a re-render
    // (e.g. a friend request accepted elsewhere) continues the layout
    // instead of restarting it from scratch
    const positions = useRef<Map<string, { x: number; y: number }>>(new Map());

    useEffect(() => {
        if (!svgRef.current || data.nodes.length === 0) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // seed each node from its last known position, if any, so the
        // simulation continues smoothly instead of teleporting nodes in
        const seededNodes: SimNode[] = data.nodes.map((n) => {
            const prev = positions.current.get(n.id);
            return prev ? { ...n, x: prev.x, y: prev.y } : { ...n };
        });

        // clear anything from a previous render before drawing again
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`);

        // arrowhead marker used on the end of each edge line
        svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 20)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "var(--color-brand)");

        // physics simulation that pushes nodes apart and pulls linked ones
        // together until they settle. Lower velocity/alpha decay than the
        // d3 defaults so nodes ease into place instead of snapping.
        const simulation = d3
            .forceSimulation(seededNodes)
            .velocityDecay(0.3)
            .alphaDecay(0.02)
            .force(
                "link",
                d3
                    .forceLink<SimNode, GraphEdge>(data.edges)
                    .id((d) => d.id)
                    .distance(130),
            )
            .force("charge", d3.forceManyBody().strength(-260))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force(
                "collision",
                d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 12),
            );

        // one line per friendship edge
        const link = svg
            .append("g")
            .selectAll("line")
            .data(data.edges)
            .join("line")
            .attr("stroke", "var(--color-border)")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrow)");

        // one draggable group per node, holding its circle and labels
        const node = svg
            .append("g")
            .selectAll<SVGGElement, SimNode>("g")
            .data(seededNodes)
            .join("g")
            .call(
                d3
                    .drag<SVGGElement, SimNode>()
                    .on("start", (event, d) => {
                        // reheat the simulation while dragging so other
                        // nodes react to the moved one
                        if (!event.active)
                            simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        // follow the cursor directly -- the simulation's
                        // own decay is what keeps the rest of the graph
                        // reacting smoothly rather than jerking
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        // release the node back to the simulation instead
                        // of pinning it where it was dropped
                        d.fx = null;
                        d.fy = null;
                    }),
            );

        // circle background, sized by shared connections and highlighted
        // for the current user
        node.append("circle")
            .attr("r", (d) => nodeRadius(d))
            .attr("fill", (d) =>
                d.isCurrentUser
                    ? "var(--color-brand)"
                    : "var(--color-bg-element)",
            )
            .attr("stroke", (d) =>
                d.isCurrentUser
                    ? "var(--color-brand-hover)"
                    : "var(--color-border)",
            )
            .attr("stroke-width", 2);

        // initials shown inside each node's circle
        node.append("text")
            .text((d) => d.initials)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", (d) =>
                d.isCurrentUser ? "#ffffff" : "var(--color-fg)",
            )
            .attr("font-size", (d) => (d.isCurrentUser ? "13px" : "11px"))
            .attr("font-family", "ui-monospace, monospace")
            .attr("font-weight", (d) => (d.isCurrentUser ? "700" : "400"));

        // full username shown below each node
        node.append("text")
            .text((d) => d.username)
            .attr("text-anchor", "middle")
            .attr("dy", (d) => nodeRadius(d) + 14)
            .attr("fill", "var(--color-comment)")
            .attr("font-size", "10px")
            .attr("font-family", "ui-monospace, monospace");

        // repositions everything on every simulation frame, and remembers
        // the latest positions for the next render
        simulation.on("tick", () => {
            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);

            seededNodes.forEach((d) => {
                positions.current.set(d.id, { x: d.x ?? 0, y: d.y ?? 0 });
            });
        });

        // stop the simulation when the component unmounts or data changes
        return () => {
            simulation.stop();
        };
    }, [data]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minHeight: "400px" }}
        />
    );
}
