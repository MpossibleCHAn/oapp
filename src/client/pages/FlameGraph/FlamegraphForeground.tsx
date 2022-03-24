import * as React from 'react';
import {
  useFlamegraphNodes,
  useFlamegraphViewConfig,
} from './FlamegraphContext';
import { FlameNode } from './types';
import useCanvas from './useCanvas';

interface FlamegraphForegroundProps {
  style: React.CSSProperties;
  onMouseMove?: (node: FlameNode | null, event: MouseEvent) => void;
}

const FlamegraphForeground = (props: FlamegraphForegroundProps) => {
  const { onMouseMove } = props;
  const { ratio, canvasWidth, canvasHeight } = useFlamegraphViewConfig();
  const { data } = useFlamegraphNodes();
  const foregroundRef = useCanvas()
  const [hoveredNode, setHoveredNode] = React.useState<FlameNode | null>(null);
  const prevHoveredFlameNode = React.useRef<FlameNode | null>(null);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      if (!foregroundRef.current) {
        return;
      }
      const ctx = foregroundRef.current.getContext('2d');
      const { nativeEvent } = event;
      const physicalViewMouseX = nativeEvent.offsetX * ratio;
      const physicalViewMouseY = nativeEvent.offsetY * ratio;
      let currentNode: FlameNode | null = null;
      let isMatch = false

      if (!ctx) return;
      const start = performance.now()
      for (const node of data) {
        const { position } = node;
        // @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
        if (
          physicalViewMouseX > position[0][0] &&
          physicalViewMouseX < position[1][0] &&
          physicalViewMouseY > position[0][1] &&
          physicalViewMouseY < position[1][1]
        ) {
          if (
            !prevHoveredFlameNode.current ||
            node.id !== prevHoveredFlameNode.current.id
          ) {
            setHoveredNode(node);
          }
          isMatch = true
          currentNode = node;
          // prevHoveredFlameNode.current = node;
          break;
        }
      }
      const end = performance.now()
      // console.log('===========> ',end - start);

      if (!isMatch) {
        setHoveredNode(null)
      }
      if (onMouseMove) {
        onMouseMove(currentNode, nativeEvent);
      }
    },
    [data]
  );

  React.useEffect(() => {
    prevHoveredFlameNode.current = hoveredNode;
  }, [hoveredNode]);

  React.useEffect(() => {
    const ctx = foregroundRef.current?.getContext('2d');
    if (!foregroundRef.current || !ctx) {
      return;
    }
    // if (prevHoveredFlameNode.current) {
    //   console.log(prevHoveredFlameNode);

    //   const { position } = prevHoveredFlameNode.current;
    //   ctx.clearRect(
    //     position[0][0],
    //     position[0][1],
    //     position[1][0] - position[0][0],
    //     position[1][1] - position[0][1]
    //   );
    // }
    ctx.clearRect(0, 0, canvasWidth * ratio, canvasHeight * ratio);
    if (hoveredNode) {
      // console.log(hoveredNode);

      const { position } = hoveredNode;
      ctx.lineWidth = 1.5 * ratio;
      ctx.strokeStyle = '#000';
      ctx.strokeRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );
    }
  }, [hoveredNode, ratio, canvasWidth, canvasHeight]);

  return (
    <div style={props.style}>
      <canvas
        id="flamegraph"
        ref={foregroundRef}
        style={{ width: canvasWidth, height: canvasHeight }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
    </div>
  );
};

export default FlamegraphForeground;
