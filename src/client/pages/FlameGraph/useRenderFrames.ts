import * as React from 'react';
import { Color } from './style';
import { CanvasRendererProps } from './types';
import { generateColor, hashEntry } from './utils';

function useRenderFrames(props: CanvasRendererProps) {
  console.log(props);

  const { data, framesCanvas, ratio, canvasWidth } = props;
  const ctx = React.useMemo(
    () => framesCanvas.getContext('2d'),
    [framesCanvas]
  );

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
    }
  }, [ctx, data, ratio, canvasWidth]);

  return renderFrames;
}

export default useRenderFrames;
