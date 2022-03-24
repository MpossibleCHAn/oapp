import * as React from 'react';
import { Color, FontSize, Sizes } from './style';
import { FlameNode, FlameCanvasRendererProps } from './types';
import { ELLIPSIS, generateColor, hashEntry, trimTextMid, useCacheMeasureTextWidth } from './utils';



function useDrawRects(
  props: FlameCanvasRendererProps,
  options?: {
    color?: string | ((node: FlameNode) => string);
  }
) {
  const { canvas, nodes, ratio, canvasDisplayWidth, canvasDisplayHeight } =
    props;

  const ctx: CanvasRenderingContext2D = React.useMemo(
    () => canvas?.getContext('2d'),
    [canvas]
  );
	// const cachedMeasureTextWidth = useCacheMeasureTextWidth(ctx)
	// const minWidthToRender = cachedMeasureTextWidth('M' + ELLIPSIS + 'M')

  const color = React.useCallback(
    (node: FlameNode) => {
      if (options?.color) {
        if (typeof options.color === 'function') {
          return options.color(node);
        }
        return options.color;
      }
      return generateColor(hashEntry(node.name));
    },
    [options?.color]
  );

  const drawRects = React.useCallback(() => {
    if (!ctx || !nodes) return;

    function drawRect(node: FlameNode) {
      const { name, position } = node;
      ctx.fillStyle = color(node);
			ctx.fillRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );
			ctx.strokeStyle = Color.RectBorder;
      ctx.lineWidth = 1.5 * ratio;
      ctx.strokeRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );
      const trimedText = trimTextMid(
        ctx,
        name,
        Math.floor(position[1][0] - position[0][0]) -
          Sizes.LabelPaddingX * 4 * ratio
      );
      ctx.font = `400 ${FontSize.LABEL * ratio}px Roboto`;
      ctx.fillStyle = Color.Label;
      ctx.fillText(
        trimedText.trimmedString,
        position[0][0] + Sizes.LabelPaddingX * ratio,
        position[0][1] + Sizes.LabelVerticalOffset * ratio
      );
    }

		for (const node of nodes) {
			drawRect(node)
		}
  }, [ctx]);

	return drawRects
}

export default useDrawRects
