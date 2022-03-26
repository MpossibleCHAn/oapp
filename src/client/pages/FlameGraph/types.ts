export type Position2D = [number, number];

// [x,y]
export type Vec2 = [number, number];
// [[x0,y0], [x1,y1]]
export type Rect = [Vec2, Vec2];

export type FlameRawTreeNode = Record<string, [FlameRawTreeNode, number]>;

export interface FlameNodeData {
  internal: number;
  cumulative: number;
  _meta: FlameRawTreeNode;
}

export interface FlameBaseNode {
  id: string;
  name: string;
  data: FlameNodeData;
  value: number;
  depth: number;
  children?: FlameBaseNode[];
}

export interface FlameNode extends FlameBaseNode {
  position: Rect;
}

export interface FlameCanvasRendererProps {
  // spaceBriefsSourceMessagePort: MessagePort;
  // entitiesCanvas: OffscreenCanvas;
  // canvas: OffscreenCanvas;
  canvas: CanvasRenderingContext2D;
  // foregroundCanvas: OffscreenCanvas;
  ratio: number;
  /** canvas 实际显示的宽度（canvas 画布宽度需乘以 ratio） */
  canvasDisplayWidth: number;
  canvasDisplayHeight: number;

  nodes: FlameNode[];
}

export interface CanvasRendererProps {
  /** phycical position node */
  data: FlameNode[];
  /** frames layer */
  framesCanvas: OffscreenCanvas;
  /** side effect layer, such as hover, fouse, selected etc */
  effectCanvas: OffscreenCanvas;
  /** mouse event layer */
  foregroundCanvas: OffscreenCanvas;

  ratio: number;
  width: number;
  height: number;
  /** canvas 实际显示的宽度（canvas 画布宽度需乘以 ratio） */
  // canvasDisplayWidth: number;
  // canvasDisplayHeight: number;
}

export interface CanvasRendererHandle {
  onPointerMove: (position: Vec2) => void
  onPointerDown: (position: Vec2) => void
  onPointerOut: () => void
}

export type CanvasRendererSubscriber = {
  type: 'handle';
  cb: (handle: CanvasRendererHandle) => void;
};

export interface FlameCanvasRendererExports {
  init: (props: CanvasRendererProps) => void;
  updateProps: (updator: Partial<CanvasRendererProps>) => void;
  subscribe: (subscriber: CanvasRendererSubscriber) => Promise<void>;
  destory: () => void;
}
