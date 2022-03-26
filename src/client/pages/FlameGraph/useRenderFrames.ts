import * as React from 'react';
import useDrawText from './useDrawText';
import { generateColor, hashEntry } from './utils';
import { CanvasRendererProps } from './types';
import { Color } from './style';

function useRenderFrames(props: CanvasRendererProps) {
  const { data, framesCanvas, ratio } = props;
  const ctx: CanvasRenderingContext2D = React.useMemo(
    () => framesCanvas.getContext('2d'),
    [framesCanvas]
  );
  const drawText = useDrawText(ctx, props);

  const renderFrames = React.useCallback(() => {
    if (!ctx) return;

    for (const node of data) {
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
      ctx.strokeStyle = Color.RectBorder;
      ctx.strokeRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );
      drawText(node);
    }
  }, [ctx, data, drawText, ratio]);

  return renderFrames;
}

export default useRenderFrames;
