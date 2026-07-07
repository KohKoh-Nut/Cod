'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode} from '@/hooks/useFriendGraph';

interface FriendGraphProps {
  data: GraphData;
}

export default function FriendGraph({ data }: FriendGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Arrow marker for edges
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 20)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#7c4dff');

    // Force simulation
    const simulation = d3
      .forceSimulation(data.nodes as any)
      .force(
        'link',
        d3
          .forceLink(data.edges)
          .id((d: any) => d.id)
          .distance(120),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Draw edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', '#2a2d3a')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    // Draw node groups
    const node = svg
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any,
      );

    // Node circle background
    node
      .append('circle')
      .attr('r', (d) => (d.isCurrentUser ? 28 : 22))
      .attr('fill', (d) => (d.isCurrentUser ? '#7c4dff' : '#20222b'))
      .attr('stroke', (d) => (d.isCurrentUser ? '#651fff' : '#2a2d3a'))
      .attr('stroke-width', 2);

    // Node initials
    node
      .append('text')
      .text((d) => d.initials)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', (d) => (d.isCurrentUser ? '#ffffff' : '#e2e4e9'))
      .attr('font-size', (d) => (d.isCurrentUser ? '13px' : '11px'))
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', (d) => (d.isCurrentUser ? '700' : '400'));

    // Username label below node
    node
      .append('text')
      .text((d) => d.username)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isCurrentUser ? 40 : 34))
      .attr('fill', '#8a8f9f')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Tick update positions
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}