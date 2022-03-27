import * as React from 'react';
import { CanvasRendererProps } from './types';
import { generateColor, hashEntry } from './utils';

const useRenderMiniMap = (props: CanvasRendererProps) => {
  const { data, miniMapCanvas, height, ratio } = props;
  const ctx: CanvasRenderingContext2D = React.useMemo(
    () => miniMapCanvas.getContext('2d'),
    [miniMapCanvas]
  );
  const canvasHeight = miniMapCanvas.height;

  const renderMiniMap = React.useCallback(() => {
    if (!ctx) return;
    for (const node of data) {
      const { name, position } = node;
      const rectColor = generateColor(hashEntry(name));
      ctx.fillStyle = rectColor;
      const compressRatio = canvasHeight / height / ratio;
      ctx.fillRect(
        position[0][0],
        position[0][1] * compressRatio,
        position[1][0] - position[0][0],
        (position[1][1] - position[0][1]) * compressRatio
      );
    }
  }, [canvasHeight, ctx, data, height, ratio]);
  return renderMiniMap;
};

export default useRenderMiniMap;
