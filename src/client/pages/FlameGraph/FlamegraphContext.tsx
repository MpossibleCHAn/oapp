import * as React from 'react';
import { Sizes } from './style';
import { FlameNode, FlameRawTreeNode, Rect } from './types';
import { useHierarchy } from './useHierarchy';

export interface FlameGraphContextProps {
  /** physicalFlameNodes  */
  data: FlameNode[];
}

export const FlameGraphContext =
  React.createContext<FlameGraphContextProps | null>(null);

export interface FlameGraphViewConfigProps {
  ratio: number;
  width: number;
  height: number;
}

export const FlameGraphViewConfig =
  React.createContext<FlameGraphViewConfigProps | null>(null);

export interface FlameGraphContextProviderProps {
  /** raw data */
  data: FlameRawTreeNode;
  /** device pixel ratio */
  ratio?: number;
  /** canvas width */
  width: number;
  /** canvas 实际显示的宽度（canvas 画布宽度需乘以 ratio） */
  // canvasDisplayWidth: number;
  // canvasDisplayHeight?: number;
  children: React.ReactNode;
  getNodeValue?: ([next, value]: [FlameRawTreeNode, number]) => number;
}

export function FlameGraphContextProvider(
  props: FlameGraphContextProviderProps
) {
  const { data, width, children } = props;
  const ratio = React.useMemo(
    () => props.ratio || window.devicePixelRatio,
    [props.ratio]
  );
  const { nodes: logicalFlameNodes, depth } = useHierarchy(data);

  const physicalFlameNodes = React.useMemo(() => {
    function convertLogicalToPhysicalPosition(node: FlameNode): Rect {
      const { position, depth } = node;
      // const x0 = canvasWidth * position[0][0] * ratio;
      // const y0 = Sizes.FrameHeight * depth * ratio;
      // const x1 = canvasWidth * position[1][0] * ratio;
      // const y1 = Sizes.FrameHeight * (depth + 1) * ratio;
      const withPaddingCanvasWidth = width - Sizes.GraphContainerPadding * 2;
      const x0 =
        (withPaddingCanvasWidth * position[0][0] +
          Sizes.GraphContainerPadding) *
        ratio;
      const y0 =
        (Sizes.FrameHeight * depth + Sizes.GraphContainerPadding) * ratio;
      const x1 =
        (withPaddingCanvasWidth * position[1][0] +
          Sizes.GraphContainerPadding) *
        ratio;
      const y1 =
        (Sizes.FrameHeight * (depth + 1) + Sizes.GraphContainerPadding) * ratio;
      return [
        [x0, y0],
        [x1, y1],
      ];
    }
    return logicalFlameNodes.map((node) => ({
      ...node,
      position: convertLogicalToPhysicalPosition(node),
    }));
  }, [logicalFlameNodes, ratio, width]);

  const height = React.useMemo(
    () => depth * Sizes.FrameHeight + Sizes.GraphContainerPadding * 2,
    [depth]
  );
  const contextValue = React.useMemo(
    () => ({ data: physicalFlameNodes }),
    [physicalFlameNodes]
  );
  const viewConfig: FlameGraphViewConfigProps = React.useMemo(
    () => ({ ratio, width, height }),
    [ratio, width, height]
  );

  return (
    <>
      <FlameGraphViewConfig.Provider value={viewConfig}>
        <FlameGraphContext.Provider value={contextValue}>
          {children}
        </FlameGraphContext.Provider>
      </FlameGraphViewConfig.Provider>
    </>
  );
}

export function useFlameGraphNodes() {
  const context = React.useContext(FlameGraphContext);
  if (!context) throw new Error('expect provider for FlamegraphContext');
  return context;
}

export function useFlameGraphViewConfig() {
  const context = React.useContext(FlameGraphViewConfig);
  if (!context) throw new Error('expect provider for FlamegraphViewConfig');
  return context;
}
