import * as React from 'react';
import {
  FlameBaseNode,
  FlameNode,
  FlameNodeData,
  FlameRawTreeNode,
  Rect,
} from './types';

export interface HierarchyProps {
  data: FlameRawTreeNode;
}

export interface HierarchyOptions {
  /** frame value */
  getValue?: ([next, value]: [FlameRawTreeNode, number]) => number;
  getNodeData?: () => void;
}

export function useHierarchy(
  data: FlameRawTreeNode,
  options?: HierarchyOptions
): {
  nodes: FlameNode[];
  height: number;
} {
  const maxDepthRef = React.useRef(0);
  const getValue = React.useCallback((node: [FlameRawTreeNode, number]) => {
    if (options?.getValue) {
      return options?.getValue(node);
    }
    return node[1];
  }, []);

  const nodes: FlameBaseNode[] = React.useMemo(() => {
    function hierarchy(
      tree: FlameRawTreeNode,
      depth: number = 0
    ): FlameBaseNode[] {
      const nodes: FlameBaseNode[] = [];
      for (const [entry, data] of Object.entries(tree)) {
        const [next, cumulative] = data;
        const internal = Object.keys(next).length
          ? cumulative - countChildrenCumulative(next)
          : cumulative;
        const nodeData: FlameNodeData = {
          internal,
          cumulative,
          _meta: tree,
        };
        const node = {
          id: entry + '__' + depth,
          name: entry,
          data: nodeData,
          value: getValue([next, cumulative]),
          depth,
          children: hierarchy(next, depth + 1),
        };
        nodes.push(node);
      }
      maxDepthRef.current = Math.max(depth, maxDepthRef.current);
      return nodes;
    }
    return hierarchy(data);
  }, [data, getValue]);

  const nodesWithPosition = React.useMemo(() => {
    // Calculate node position
    const maxDepth = maxDepthRef.current;
    function partition(nodes: FlameBaseNode[]) {
      const positionNodes: FlameNode[] = [];
      function handler(
        nodes: FlameBaseNode[],
        parentPosition: Rect = [
          [0, 0],
          [1, 1],
        ]
      ) {
        const sortedNodes = nodes.sort((a, b) => a.value - b.value);
        const total = sortedNodes.reduce(
          (prev, curr) => (prev += curr.value),
          0
        );
        let x0 = parentPosition[0][0],
          x1 = parentPosition[1][0];
        const len = x1 - x0;
        for (const node of sortedNodes) {
          const x = (node.value / total) * len;
          const x1 = x0 + x;
          const y0 = node.depth / maxDepth;
          const y1 = (node.depth + 1) / maxDepth;
          const position: Rect = [
            [x0, y0],
            [x1, y1],
          ];
          if (node.children && node.children.length) {
            handler(node.children, position);
          }
          positionNodes.push({ ...node, position });
          x0 += x;
        }
      }
      handler(nodes);
      return positionNodes;
    }
    return partition(nodes);
  }, [nodes]);

  return {
    nodes: nodesWithPosition,
    height: maxDepthRef.current,
  };
}

function countChildrenCumulative(children: FlameRawTreeNode) {
  return Object.keys(children).reduce(
    (acc, curr) => (acc += children[curr][1]),
    0
  );
}
