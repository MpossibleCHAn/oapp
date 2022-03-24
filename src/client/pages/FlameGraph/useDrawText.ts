import { FlameNode } from './types';
import * as React from 'react';
import { useFlamegraphViewConfig } from './FlamegraphContext';
import { findValueBisect } from './utils';
import { Color, FontSize, Sizes } from './style';

export const ELLIPSIS = '\u2026';

interface useDrawTextProps {
  ctx: CanvasRenderingContext2D;
}

function useDrawText(ctx: CanvasRenderingContext2D) {
  const { ratio } = useFlamegraphViewConfig();
  const textWidthCache = useCacheMeasureTextWidth(ctx, ratio);
  const minWidth = textWidthCache('M' + ELLIPSIS + 'M');

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
    []
  );
  const drawText = React.useCallback(
    (
      node: FlameNode,
      beforeDraw?: (ctx: CanvasRenderingContext2D, node: FlameNode) => void
    ) => {
      const { name, position } = node;
      const width = textWidthCache(name);
      if (!width || width < minWidth) {
        return;
      }
      if (beforeDraw) {
        beforeDraw(ctx, node);
      }
      const trimedText = trimTextMid(
        name,
        Math.floor(
          position[1][0] - position[0][0] - Sizes.LabelPaddingX * 4 * ratio
        )
      );
      ctx.font = `400 ${FontSize.LABEL * ratio}px Roboto`;
      ctx.fillStyle = Color.Label;
      ctx.fillText(
        trimedText.trimmedString,
        position[0][0] + Sizes.LabelPaddingX * ratio,
        position[0][1] + Sizes.LabelVerticalOffset * ratio
      );
    },
    [ctx, ratio, textWidthCache, trimTextMid]
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
  }, [ratio]);

  return React.useCallback(
    (text: string) => {
      if (!measureTextCache.has(text)) {
        measureTextCache.set(text, ctx.measureText(text).width);
      }
      return measureTextCache.get(text) as number;
    },
    [ctx]
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

  let prefixLength = Math.floor(length / 2);
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

// Trim text to fit within the given number of pixels on the canvas
// export function trimTextMid(
//   ctx: CanvasRenderingContext2D,
//   text: string,
//   maxWidth: number
// ): TrimmedTextResult {
//   if (cachedMeasureTextWidth(ctx, text) <= maxWidth) {
//     return buildTrimmedText(text, text.length);
//   }
//   const [lo] = findValueBisect(
//     0,
//     text.length,
//     (n) => {
//       return cachedMeasureTextWidth(
//         ctx,
//         buildTrimmedText(text, n).trimmedString
//       );
//     },
//     maxWidth
//   );
//   return buildTrimmedText(text, lo);
// }

export default useDrawText;
