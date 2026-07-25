"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphData, GraphNode } from "@/hooks/friends/useFriendGraph";

interface FriendGraphProps {
    data: GraphData;
}

// force-directed graph of the current user and their friends, drawn
// with d3 directly onto an svg ref (not through react's render cycle)
export default function FriendGraph({ data }: FriendGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.nodes.length === 0) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

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

        // physics simulation that pushes nodes apart and pulls linked
        // ones together until they settle into a readable layout
        const simulation = d3
            .forceSimulation(data.nodes as any)
            .force(
                "link",
                d3
                    .forceLink(data.edges)
                    .id((d: any) => d.id)
                    .distance(120),
            )
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(50));

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
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(
                d3
                    .drag<SVGGElement, GraphNode>()
                    .on("start", (event, d: any) => {
                        // reheat the simulation while dragging so other
                        // nodes react to the moved one
                        if (!event.active)
                            simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d: any) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d: any) => {
                        if (!event.active) simulation.alphaTarget(0);
                        // release the node back to the simulation instead
                        // of pinning it where it was dropped
                        d.fx = null;
                        d.fy = null;
                    }) as any,
            );

        // circle background, bigger and highlighted for the current user
        node.append("circle")
            .attr("r", (d) => (d.isCurrentUser ? 28 : 22))
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
            .attr("dy", (d) => (d.isCurrentUser ? 40 : 34))
            .attr("fill", "var(--color-comment)")
            .attr("font-size", "10px")
            .attr("font-family", "ui-monospace, monospace");

        // repositions everything on every simulation frame
        simulation.on("tick", () => {
            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
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
