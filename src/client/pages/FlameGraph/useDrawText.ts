import * as React from 'react';
import { findValueBisect } from './utils';
import { CanvasRendererProps, FlameNode } from './types';
import { Color, FontSize, Sizes } from './style';

export const ELLIPSIS = '\u2026';
const FONT_FAMILY = 'Roboto Mono';
const MIN_FRAME_TO_RENDER = 8;

function useDrawText(
  ctx: CanvasRenderingContext2D,
  props: CanvasRendererProps
) {
  const { ratio } = props;
  const textWidthCache = useCacheMeasureTextWidth(ctx, ratio);
  const minWidthToRender = textWidthCache('M' + ELLIPSIS + 'M');

  // Trim text to fit within the given number of pixels on the canvas
  const trimTextMid = React.useCallback(
    (text: string, maxWidth: number): TrimmedTextResult => {
      if (textWidthCache(text) <= maxWidth) {
        return buildTrimmedText(text, text.length);
      }
      const [lo] = findValueBisect(
        0,
        text.length,
        (n) => textWidthCache(buildTrimmedText(text, n).trimmedString),
        maxWidth
      );
      return buildTrimmedText(text, lo);
    },
    [textWidthCache]
  );
  const drawText = React.useCallback(
    (
      node: FlameNode,
      beforeDraw?: (ctx: CanvasRenderingContext2D, node: FlameNode) => void
    ) => {
      const { name, position } = node;
      const width = textWidthCache(name);
      const frameWidth = Math.floor(
        position[1][0] - position[0][0] - Sizes.LabelPaddingX * 4 * ratio
      );
      if (
        !width ||
        width < minWidthToRender ||
        frameWidth < MIN_FRAME_TO_RENDER
      ) {
        return;
      }
      if (beforeDraw) {
        beforeDraw(ctx, node);
      }
      const trimedText = trimTextMid(name, frameWidth);
      // ctx.font = `800 ${FontSize.LABEL * ratio}px "Mono" Roboto`;
      ctx.font = `400 ${FontSize.LABEL * ratio}px ${FONT_FAMILY}`;
      ctx.fillStyle = Color.Label;
      ctx.fillText(
        trimedText.trimmedString,
        position[0][0] + Sizes.LabelPaddingX * ratio,
        position[0][1] + Sizes.LabelVerticalOffset * ratio
      );
    },
    [ctx, minWidthToRender, ratio, textWidthCache, trimTextMid]
  );

  return drawText;
}

export function useCacheMeasureTextWidth(
  ctx: CanvasRenderingContext2D,
  ratio: number
): (text: string) => number {
  const [measureTextCache] = React.useState(new Map<string, number>());
  const prevRatio = React.useRef<number>(ratio || window.devicePixelRatio);

  React.useLayoutEffect(() => {
    if (ratio !== prevRatio.current) {
      measureTextCache.clear();
    }
    prevRatio.current = ratio;
  }, [measureTextCache, ratio]);

  return React.useCallback(
    (text: string) => {
      if (!measureTextCache.has(text)) {
        measureTextCache.set(text, ctx.measureText(text).width);
      }
      return measureTextCache.get(text) as number;
    },
    [ctx, measureTextCache]
  );
}

interface TrimmedTextResult {
  trimmedString: string;
  trimmedLength: number;
  prefixLength: number;
  suffixLength: number;
  originalLength: number;
  originalString: string;
}

// Trim text, placing an ellipsis in the middle, with a slight bias towards
// keeping text from the beginning rather than the end
export function buildTrimmedText(
  text: string,
  length: number
): TrimmedTextResult {
  if (text.length <= length) {
    return {
      trimmedString: text,
      trimmedLength: text.length,
      prefixLength: text.length,
      suffixLength: 0,
      originalString: text,
      originalLength: text.length,
    };
  }

  const prefixLength = Math.floor(length / 2);
  const suffixLength = length - prefixLength - 1;
  const prefix = text.substring(0, prefixLength);
  const suffix = text.substring(text.length - suffixLength);
  const trimmedString = prefix + ELLIPSIS + suffix;

  return {
    trimmedString,
    trimmedLength: trimmedString.length,
    prefixLength: prefix.length,
    suffixLength: suffix.length,
    originalString: text,
    originalLength: text.length,
  };
}

export default useDrawText;
