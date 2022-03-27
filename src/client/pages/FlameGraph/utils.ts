import * as React from 'react'
import { FlameBaseNode } from './types';

// bisection algorithm
export function findValueBisect(
  lo: number,
  hi: number,
  f: (val: number) => number,
  target: number,
  targetRangeSize = 1
): [number, number] {
  console.assert(!isNaN(targetRangeSize) && !isNaN(target));
  // eslint-disable-next-line no-constant-condition
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
  alpha = 1,
  subTheme: ColorTheme = Theme.HOT
): string {
  const fn = ColorTheme[subTheme];
  return `rgb(${fn(hash).map(Math.round).join(',')},${alpha})`;
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

/**
 * Converts a React node to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * and booleans are discarded.
 *
 * @see
 * https://github.com/palantir/blueprint/blob/c65072827a79c3f52f5d9037f6fd42f3160d2f9f/packages/core/src/common/utils/reactUtils.ts#L50
 */
export function ensureElement(
  child: React.ReactNode | undefined,
  tagName: keyof JSX.IntrinsicElements = "span"
): (React.ReactElement & { ref: unknown }) | undefined {
  if (child == null || typeof child === "boolean") {
    return undefined;
  } else if (typeof child === "string") {
    // cull whitespace strings
    return child.trim().length > 0
      ? React.createElement(tagName, {}, child)
      : undefined;
  } else if (
    typeof child === "number" ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (child as any).type === "symbol" ||
    Array.isArray(child)
  ) {
    // React.Fragment has a symbol type, ReactNodeArray extends from Array
    return React.createElement(tagName, {}, child);
  } else if (React.isValidElement(child)) {
    return child as React.ReactElement & { ref: unknown };
  } else {
    // child is inferred as {}
    return undefined;
  }
}
