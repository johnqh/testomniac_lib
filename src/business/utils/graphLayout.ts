import dagre from 'dagre';

/** A node to lay out. Only its `id` is required for layout. */
export interface DagreGraphNode {
  id: string;
}

/** A directed edge between two node ids. */
export interface DagreGraphEdge {
  source: string;
  target: string;
}

export interface DagreLayoutOptions {
  /** Node width, in pixels. */
  nodeWidth: number;
  /** Node height, in pixels. */
  nodeHeight: number;
  /** Layout direction. Defaults to `'TB'` (top-to-bottom). */
  rankdir?: 'TB' | 'LR' | 'BT' | 'RL';
  /** Separation between adjacent nodes in the same rank. Defaults to 60. */
  nodesep?: number;
  /** Separation between ranks. Defaults to 80. */
  ranksep?: number;
}

/**
 * Computes a hierarchical layout for a directed graph using dagre.
 *
 * Returns a map from each node id to its **top-left** position (already offset
 * from dagre's centered coordinates by half the node dimensions), so callers
 * can apply the positions directly to fixed-size nodes without further math.
 *
 * This helper is intentionally UI-framework-agnostic: pass any node objects
 * that have an `id` and edges with `source`/`target`, and map the returned
 * positions onto your rendering layer (e.g. React Flow nodes).
 *
 * @example
 * ```typescript
 * const positions = layoutDagreGraph(nodes, edges, {
 *   nodeWidth: 200,
 *   nodeHeight: 60,
 * });
 * const laidOut = nodes.map(n => ({ ...n, position: positions.get(n.id)! }));
 * ```
 */
export function layoutDagreGraph(
  nodes: readonly DagreGraphNode[],
  edges: readonly DagreGraphEdge[],
  options: DagreLayoutOptions
): Map<string, { x: number; y: number }> {
  const {
    nodeWidth,
    nodeHeight,
    rankdir = 'TB',
    nodesep = 60,
    ranksep = 80,
  } = options;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir, nodesep, ranksep });

  nodes.forEach(node => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach(node => {
    const pos = g.node(node.id);
    positions.set(node.id, {
      x: pos.x - nodeWidth / 2,
      y: pos.y - nodeHeight / 2,
    });
  });
  return positions;
}
