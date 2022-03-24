import * as React from 'react';
import data from './data3';
import {
  FlameBaseNode,
  FlameNode,
  FlameNodeData,
  FlameRawTreeNode,
  FlameCanvasRendererProps,
  Rect,
} from './types';
import useResizeObserver from '../../hooks/useResizeObserver';
import { Color, FontSize, Sizes } from './style';
import useDrawRects from './useDrawRect';
import { buildTrimmedText, trimTextMid } from './utils';
import debounce from 'lodash/debounce';
import * as Comlink from 'comlink';
import { nanoid } from 'nanoid';

interface FlameGraphProps<TNode> {
  nodes: TNode[];
  getNodeValue?: (node: TNode) => number;
  // renderNode: (node: TNode) =>
}

interface hierarchyOptions {
  data: FlameRawTreeNode;
  /** frame value */
  getValue?: ([next, value]: [FlameRawTreeNode, number]) => number;
  getNodeData?: () => void;
}

export function useHierarchy(options: hierarchyOptions): {
  nodes: FlameNode[];
  height: number;
} {
  const maxDepthRef = React.useRef(0);
  const getValue = React.useCallback((node: [FlameRawTreeNode, number]) => {
    if (options.getValue) {
      return options.getValue(node);
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
    return hierarchy(options.data);
  }, [options.data, getValue]);

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
    height: maxDepthRef.current * Sizes.FrameHeight,
  };
}

export const countChildrenCumulative = (children: FlameRawTreeNode) =>
  Object.keys(children).reduce((acc, curr) => (acc += children[curr][1]), 0);

function countHeight(nodes: FlameBaseNode[]) {
  function dfs(nodes: FlameBaseNode[]): number {
    const depthList = nodes.map((node) => {
      if (node.children && node.children.length) {
        return Math.max(node.depth, dfs(node.children));
      } else {
        return node.depth;
      }
    });
    return Math.max(...depthList);
  }
  // 因为 depth 是从 0 开始计算，故此处需要 +1 才是实际的高度
  return dfs(nodes) + 1;
}

// Convert logical nodes to physical nodes
function usePhysicalFlameNodes(props: FlameCanvasRendererProps) {
  const { nodes, canvasDisplayWidth, ratio } = props;
  const physicalFlameNode = React.useMemo(() => {
    function transform(node: FlameNode): Rect {
      const { position, depth } = node;
      const x0 = canvasDisplayWidth * position[0][0] * ratio;
      const y0 = Sizes.FrameHeight * depth * ratio;
      const x1 = canvasDisplayWidth * position[1][0] * ratio;
      const y1 = Sizes.FrameHeight * (depth + 1) * ratio;
      // const x0 = (canvasWidth * position[0][0] - Sizes.GraphContainerPadding) * ratio;
      // const y0 = (Sizes.FrameHeight * depth - Sizes.GraphContainerPadding) * ratio;
      // const x1 = (canvasWidth * position[1][0] - Sizes.GraphContainerPadding) * ratio;
      // const y1 = (Sizes.FrameHeight * (depth + 1) - Sizes.GraphContainerPadding) * ratio;
      return [
        [x0, y0],
        [x1, y1],
      ];
    }
    return nodes.map((node) => ({
      ...node,
      position: transform(node),
    }));
  }, [nodes, canvasDisplayWidth, ratio]);

  return physicalFlameNode;
}


const Flame = () => {
  const foregroundRef = React.useRef<HTMLCanvasElement>(null);
  const flameRef = React.useRef<HTMLCanvasElement>(null);
  const [flameContainerRef, rect] = useResizeObserver();
  const ratio = window.devicePixelRatio;
  const root = {
    root: [data.flame_all.tree, data.flame_all.num],
  } as unknown as FlameRawTreeNode;
  const [hoverNode, setHoverNode] = React.useState<FlameNode | null>(null);
  const [worker] = React.useState(() => {
    const worker = new Worker('/client/worker.js');
    return Comlink.wrap(worker);
  });

  const { nodes: logicalFlameNodes, height } = useHierarchy({ data: root });
  console.log(height, 555);

  const prevHoverFlameNode = React.useRef<string>();

  const props: FlameCanvasRendererProps = {
    canvas: flameRef.current,
    nodes: logicalFlameNodes,
    ratio,
    canvasDisplayWidth: rect.width,
    // canvasDisplayHeight: rect.height,
    canvasDisplayHeight: height + 2 * Sizes.GraphContainerPadding,
  };
  const physicalFlameNodes = usePhysicalFlameNodes(props);

  // const drawRects = useDrawRects({ ...props, nodes: physicalFlameNodes });

  // React.useLayoutEffect(() => {
  //   if (flameRef.current) {
  //     flameRef.current.width = rect.width * ratio;
  //     flameRef.current.height = rect.height * ratio;
  //     drawRects();
  //   }
  // }, [drawRects, rect]);
  React.useEffect(() => {
    async function effect() {
      const fn = await worker.flamegraphRender();
      console.log(fn);
    }
    effect();
  }, []);

  React.useEffect(() => {
    const ctx = flameRef.current?.getContext('2d');
    if (!flameRef.current || !ctx) {
      return;
    }

    async function handleMousemove(e: MouseEvent) {
      const physicalViewMouseX = e.offsetX * ratio;
      const physicalViewMouseY = e.offsetY * ratio;
      if (!ctx) return;
      // setHoverNode(null)
      for (const node of physicalFlameNodes) {
        const { position } = node;
        if (
          physicalViewMouseX > position[0][0] &&
          physicalViewMouseX < position[1][0] &&
          physicalViewMouseY > position[0][1] &&
          physicalViewMouseY < position[1][1]
        ) {
          if (
            !prevHoverFlameNode.current ||
            node.id !== prevHoverFlameNode.current
          ) {
            setHoverNode(node);
          }
          prevHoverFlameNode.current = node.id;
          break;
        }
      }
      console.log('none');
    }
    flameRef.current.addEventListener('mousemove', handleMousemove);

    return () => {
      flameRef.current?.removeEventListener('mousemove', handleMousemove);
    };
  }, [physicalFlameNodes, ratio]);

  React.useEffect(() => {
    console.log(hoverNode);
    const width = rect.width * ratio;
    const ctx = foregroundRef.current?.getContext("2d")
    if (foregroundRef.current) {
      foregroundRef.current.width = rect.width * ratio;
      foregroundRef.current.height = height * ratio;
    }

    if (!ctx || !width || !height) {
      return;
    }


  }, [rect, hoverNode])

  React.useEffect(() => {
    const ctx = flameRef.current?.getContext('2d');
    const width = rect.width * ratio;
    const height = rect.height;
    console.log(height, rect.height);

    if (flameRef.current) {
      flameRef.current.width = rect.width * ratio;
      flameRef.current.height = height * ratio;
    }

    if (!ctx || !width || !height) {
      return;
    }

    for (const node of physicalFlameNodes) {
      const { name, position } = node;
      const rectColor = generateColor(hashEntry(name));
      ctx.fillStyle = rectColor;
      ctx.fillRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );

      ctx.lineWidth = 1.5 * ratio;
      if (node.id === hoverNode?.id) {
        ctx.strokeStyle = '#000';
        const offset = 0 * ratio;
        ctx.strokeRect(
          position[0][0],
          position[0][1],
          position[1][0] - position[0][0] - offset,
          position[1][1] - position[0][1] - offset
        );
      } else {
        ctx.strokeStyle = Color.RectBorder;
        ctx.strokeRect(
          position[0][0],
          position[0][1],
          position[1][0] - position[0][0],
          position[1][1] - position[0][1]
        );
      }

      const trimedText = trimTextMid(
        ctx,
        name,
        Math.floor(position[1][0] - position[0][0]) -
          Sizes.LabelPaddingX * 4 * ratio
      );

      // console.log(trimedText);

      ctx.font = `400 ${FontSize.LABEL * ratio}px Roboto`;
      ctx.fillStyle = Color.Label;
      ctx.fillText(
        trimedText.trimmedString,
        position[0][0] + Sizes.LabelPaddingX * ratio,
        position[0][1] + Sizes.LabelVerticalOffset * ratio
      );
    }
  }, [rect, physicalFlameNodes, height, hoverNode]);

  return (
    <>
      <pre>{hoverNode?.name}</pre>
      <div
        ref={flameContainerRef}
        className="grid"
        style={{ display: 'grid', marginTop: 24}}
      >
        {/* <canvas
          id="foreground"
          ref={foregroundRef}
          style={{ position: "absolute", top:0, left: 0, width: '100%', height: height }}
        /> */}
        <canvas
          id="flame"
          ref={flameRef}
          style={{ width: '100%', height: height }}
        />
      </div>
    </>
  );
};

export enum Theme {
  HOT,
  COLD,
  NEUTRAL,
}

/**
 * custom your theme
 * base: (v:number) => [r, g, b]
 */
export const ColorTheme = {
  [Theme.HOT]: (v: number) => [205 + 50 * v, 230 * v, 55 * v],
  [Theme.COLD]: (v: number) => [55 * v, 230 * v, 205 + 50 * v],
  [Theme.NEUTRAL]: (v: number) => [230 * v, 55 * v, 205 + 50 * v],
};
export type ColorTheme = keyof typeof ColorTheme;
/**
 * Count entry hash by entry name
 * @param entry
 * @returns
 */
function hashEntry(entry: string): number {
  if (!entry) {
    return 0;
  }
  // remove module names if exists.
  const _entry = entry.substring(entry.lastIndexOf('.') + 1);
  let vector = 0,
    weight = 1,
    max = 1,
    mod = 10;
  const hashChars = 8;
  for (let i = 0; i < Math.min(_entry.length, hashChars); i++) {
    const rem = _entry.charCodeAt(i) % mod;
    vector += (rem / mod) * weight;
    mod += 1;
    max += 1 * weight;
    weight *= 0.7;
  }
  return Math.pow(1 - vector / max, 2);
}

/**
 * Generate color by hash (entry)
 * @param hash
 * @param subTheme
 * @returns
 */
function generateColor(hash: number, subTheme: ColorTheme = Theme.HOT): string {
  const fn = ColorTheme[subTheme];
  return `rgb(${fn(hash).map(Math.round).join(',')})`;
}

export default Flame;
