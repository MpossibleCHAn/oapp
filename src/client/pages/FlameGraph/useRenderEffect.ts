import * as React from 'react';
import { CanvasRendererProps, FlameNode } from './types';

function useRenderEffect(
  props: CanvasRendererProps,
  options: {
    hoveredNode: FlameNode | undefined;
  }
) {
  const { effectCanvas, ratio } = props;
  const { hoveredNode } = options;
  const ctx: CanvasRenderingContext2D = React.useMemo(
    () => effectCanvas.getContext('2d'),
    [effectCanvas]
  );
  const prevHoveredNode = React.useRef<FlameNode>();

  React.useEffect(() => {
    prevHoveredNode.current = hoveredNode;
  }, [hoveredNode]);

  const renderEffect = React.useCallback(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
    if (!hoveredNode) return;

    const { position } = hoveredNode;
    ctx.lineWidth = 1.5 * ratio;
    ctx.strokeStyle = '#000';
    ctx.strokeRect(
      position[0][0],
      position[0][1],
      position[1][0] - position[0][0],
      position[1][1] - position[0][1]
    );
  }, [ctx, effectCanvas.height, effectCanvas.width, hoveredNode, ratio]);

  return renderEffect;
}

export default useRenderEffect;
