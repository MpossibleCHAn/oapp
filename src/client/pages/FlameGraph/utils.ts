import * as React from 'react';
import { FlameBaseNode } from './types';

export const ELLIPSIS = '\u2026';

export function useCacheMeasureTextWidth(
  ctx: CanvasRenderingContext2D,
  ratio: number
): (text: string) => number | undefined {
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
      return measureTextCache.get(text);
    },
    [ctx]
  );
}

// NOTE: This blindly assumes the same result across contexts.
const measureTextCache = new Map<string, number>();

let lastDevicePixelRatio = -1;
export function cachedMeasureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string
): number {
  if (window.devicePixelRatio !== lastDevicePixelRatio) {
    // This cache is no longer valid!
    measureTextCache.clear();
    lastDevicePixelRatio = window.devicePixelRatio;
  }
  if (!measureTextCache.has(text)) {
    measureTextCache.set(text, ctx.measureText(text).width);
  }
  return measureTextCache.get(text)!;
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
export function trimTextMid(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): TrimmedTextResult {
  if (cachedMeasureTextWidth(ctx, text) <= maxWidth) {
    return buildTrimmedText(text, text.length);
  }
  const [lo] = findValueBisect(
    0,
    text.length,
    (n) => {
      return cachedMeasureTextWidth(
        ctx,
        buildTrimmedText(text, n).trimmedString
      );
    },
    maxWidth
  );
  return buildTrimmedText(text, lo);
}

// bisection algorithm
export function findValueBisect(
  lo: number,
  hi: number,
  f: (val: number) => number,
  target: number,
  targetRangeSize = 1
): [number, number] {
  console.assert(!isNaN(targetRangeSize) && !isNaN(target));
  while (true) {
    if (hi - lo <= targetRangeSize) return [lo, hi];
    const mid = (hi + lo) / 2;
    const val = f(mid);
    if (val < target) lo = mid;
    else hi = mid;
  }
}

/**
 * Count entry hash by entry name
 * @param entry
 * @returns
 */
export function hashEntry(entry: string): number {
  if (!entry) {
    return 0;
  }
  // remove module names if exists.
  const _entry = entry.substring(entry.lastIndexOf('.') + 1);
  let vector = 0,
    weight = 1,
    max = 1,
    mod = 10;
  const hashChars = 8;
  for (let i = 0; i < Math.min(_entry.length, hashChars); i++) {
    const rem = _entry.charCodeAt(i) % mod;
    vector += (rem / mod) * weight;
    mod += 1;
    max += 1 * weight;
    weight *= 0.7;
  }
  return Math.pow(1 - vector / max, 2);
}

export enum Theme {
  HOT,
  COLD,
  NEUTRAL,
}

/**
 * custom your theme
 * base: (v:number) => [r, g, b]
 */
export const ColorTheme = {
  [Theme.HOT]: (v: number) => [205 + 50 * v, 230 * v, 55 * v],
  [Theme.COLD]: (v: number) => [55 * v, 230 * v, 205 + 50 * v],
  [Theme.NEUTRAL]: (v: number) => [230 * v, 55 * v, 205 + 50 * v],
};
export type ColorTheme = keyof typeof ColorTheme;

/**
 * Generate color by hash (entry)
 * @param hash
 * @param subTheme
 * @returns
 */
export function generateColor(
  hash: number,
  subTheme: ColorTheme = Theme.HOT
): string {
  const fn = ColorTheme[subTheme];
  return `rgb(${fn(hash).map(Math.round).join(',')})`;
}

/**
 * @deprecated
 * @param nodes
 * @returns
 */
export function countHeight(nodes: FlameBaseNode[]) {
  function dfs(nodes: FlameBaseNode[]): number {
    const depthList = nodes.map((node) => {
      if (node.children && node.children.length) {
        return Math.max(node.depth, dfs(node.children));
      } else {
        return node.depth;
      }
    });
    return Math.max(...depthList);
  }
  // 因为 depth 是从 0 开始计算，故此处需要 +1 才是实际的高度
  return dfs(nodes) + 1;
}

export function minDrawWidth(ctx: CanvasRenderingContext2D) {
  // const
}
