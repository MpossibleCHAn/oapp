import * as React from 'react';
import { CanvasRendererProps, Vec2, FlameNode } from './types';

function usePointer(props: CanvasRendererProps) {
  const { data, ratio } = props;
  const [selectedNode, setSelecedNode] = React.useState<FlameNode>()
  const [hoveredNode, setHoveredNode] = React.useState<FlameNode>();
  const [isFixedMode, setIsFixedMode] = React.useState(false)
  const [fixedNode, setFixedNode] = React.useState<FlameNode>()
  const prevHoveredNode = React.useRef<FlameNode | null>(null);

  const handlePointerMove = React.useCallback(
    (position: Vec2) => {
      const [x, y] = position;
      const physicalViewMouseX = x * ratio;
      const physicalViewMouseY = y * ratio;
      let matchNode;
      let isMatch = false;
      for (const node of data) {
        const { position } = node;
        if (
          physicalViewMouseX >= position[0][0] &&
          physicalViewMouseX < position[1][0] &&
          physicalViewMouseY >= position[0][1] &&
          physicalViewMouseY < position[1][1]
        ) {
          if (
            !prevHoveredNode.current ||
            node.id !== prevHoveredNode.current.id
          ) {
            setHoveredNode(node);
            prevHoveredNode.current = node;
          }
          matchNode = node
          isMatch = true;
          break;
        }
      }
      if (!isMatch) {
        setHoveredNode(undefined);
        prevHoveredNode.current = null;
      }
      return matchNode
    },
    [data, ratio]
  );

  const handlePointerDown = React.useCallback(() => {
    return hoveredNode
  }, [hoveredNode])

  const handlePointerOut = React.useCallback(() => {
    setHoveredNode(undefined)
    prevHoveredNode.current = null
  }, [])

  const handleContextMenu = React.useCallback(() => {
    console.log('cccc');

  }, [])

  return {
    handlePointerMove,
    handlePointerDown,
    handlePointerOut,
    handleContextMenu,
    hoveredNode,
    selectedNode
  };
}

export default usePointer;
