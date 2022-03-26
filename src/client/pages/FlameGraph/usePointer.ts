import * as React from 'react';
import { CanvasRendererProps, Vec2, FlameNode } from './types';

function usePointer(props: CanvasRendererProps) {
  const { data, ratio } = props;
  const [hoveredNode, setHoveredNode] = React.useState<FlameNode | null>(null);
  const prevHoveredNode = React.useRef<FlameNode | null>(null);

  const handlePointerMove = React.useCallback(
    (position: Vec2) => {
      const [x, y] = position;
      const physicalViewMouseX = x * ratio;
      const physicalViewMouseY = y * ratio;
      let isMatch = false;
      for (const node of data) {
        const { position } = node;
        if (
          physicalViewMouseX > position[0][0] &&
          physicalViewMouseX < position[1][0] &&
          physicalViewMouseY > position[0][1] &&
          physicalViewMouseY < position[1][1]
        ) {
          if (
            !prevHoveredNode.current ||
            node.id !== prevHoveredNode.current.id
          ) {
            setHoveredNode(node);
            prevHoveredNode.current = node;
          }
          isMatch = true;
          break;
        }
      }
      if (!isMatch) {
        setHoveredNode(null);
        prevHoveredNode.current = null;
      }
    },
    [data, ratio]
  );

  const handlePointerDown = React.useCallback(() => {
    return hoveredNode
  }, [hoveredNode])

  const handlePointerOut = React.useCallback(() => {
    setHoveredNode(null)
    prevHoveredNode.current = null
  }, [])

  return {
    handlePointerMove,
    handlePointerDown,
    handlePointerOut,
    hoveredNode,
  };
}

export default usePointer;
