import * as React from 'react';
import * as Comlink from 'comlink';
import {
  useFloating,
  shift,
  offset,
  autoPlacement,
} from '@floating-ui/react-dom';
import useResizeObserver from '../../hooks/useResizeObserver';
import {
  FlameGraphContextProvider,
  useFlameGraphNodes,
  useFlameGraphViewConfig,
} from './FlamegraphContext';
import {
  CanvasRendererHandle,
  CanvasRendererProps,
  FlameCanvasRendererExports,
  FlameNode,
  FlameRawTreeNode,
  Vec2,
} from './types';
import GraphTooltip from './GraphTooltip';

const GRAPH_MIN_WIDTH = 240;

export interface FlameGraphProps {
  data: FlameRawTreeNode;
  isReverse?: boolean;
  ratio?: number;
  getNodeValue?: ([next, value]: [FlameRawTreeNode, number]) => number;
  tooltip?: (node: FlameNode | undefined) => React.ReactNode | string;
}

const FlameGraphWrapper = (props: FlameGraphProps) => {
  const { data, ratio } = props;
  const [containerRef, rect] = useResizeObserver();

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'grid', width: '100%' }}
    >
      <FlameGraphContextProvider data={data} ratio={ratio} width={rect.width}>
        {rect.width >= GRAPH_MIN_WIDTH && <FlameGraph {...props} />}
      </FlameGraphContextProvider>
    </div>
  );
};

const FlameGraph = (props: FlameGraphProps) => {
  const { tooltip } = props;
  const { width, height } = useFlameGraphViewConfig();
  const [isFiexedTooltip, setIsFixedTooltip] = React.useState(false);
  const [fixedNode, setFixedNode] = React.useState<FlameNode>();
  const [hoveredNode, setHoveredNode] = React.useState<FlameNode>();
  const rendererProxyRef =
    React.useRef<Comlink.Remote<FlameCanvasRendererExports>>();
  const interventionRef = React.useRef<HTMLDivElement>(null);

  const { x, y, reference, floating, strategy } = useFloating({
    placement: 'right',
    middleware: [shift(), offset(32), autoPlacement()],
  });

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  };

  const {
    framesCanvasRef,
    effectCanvasRef,
    foregroundCanvasRef,
    miniMapCanvasRef,
    handle,
  } = useRendererWorker();

  const rendererHandleRef = React.useRef(handle);
  rendererHandleRef.current = handle;

  const handleTooltipReference = React.useCallback(
    (position: Vec2) => {
      const [x, y] = position;
      reference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x,
            y,
            top: y,
            left: x,
            right: x,
            bottom: y,
          };
        },
      });
    },
    [reference]
  );

  const handlePointerMove = React.useCallback(
    async (event: React.PointerEvent) => {
      const { nativeEvent } = event;
      const { offsetX, offsetY, clientX, clientY } = nativeEvent;
      const node = await rendererHandleRef.current?.onPointerMove([
        offsetX,
        offsetY,
      ]);
      setHoveredNode(node);
      if (isFiexedTooltip) {
        return;
      }
      // if (node && node.id !== prevHoveredNode.current?.id) {
      reference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            top: clientY,
            left: clientX,
            right: clientX,
            bottom: clientY,
          };
        },
      });
      // }
      // prevHoveredNode.current = node;
    },
    [isFiexedTooltip, reference]
  );

  const handlePointerDown = React.useCallback(
    async (event: React.PointerEvent<HTMLElement>) => {
      const { nativeEvent } = event;
      const { offsetX, offsetY } = nativeEvent;
      const node = await rendererHandleRef.current?.onPointerDown([
        offsetX,
        offsetY,
      ]);
    },
    []
  );

  const handlePointerOut = React.useCallback(
    (event: React.PointerEvent<HTMLHeadElement>) => {
      // console.log(event);
      rendererHandleRef.current?.onPointerOut();
    },
    []
  );

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent) => {
      console.log(event);
      event.preventDefault();
      const { clientX, clientY } = event;
      setIsFixedTooltip((prev) =>
        hoveredNode?.id === fixedNode?.id ? !prev : true
      );
      setFixedNode(hoveredNode);
      handleTooltipReference([clientX, clientY]);
    },
    [hoveredNode, handleTooltipReference, fixedNode?.id]
  );

  const tooltipContent = React.useMemo(() => {
    const node = isFiexedTooltip ? fixedNode : hoveredNode;
    if (tooltip) {
      return tooltip(node);
    }
    return null;
  }, [fixedNode, hoveredNode, isFiexedTooltip, tooltip]);

  React.useLayoutEffect(() => {
    if (!interventionRef.current) return;
    const target = interventionRef.current;
    // https://developers.google.com/web/updates/2019/02/scrolling-intervention
    function handleContainerWheel(event: WheelEvent) {
      // ctrl + mouse wheel for zoom
      if (event.ctrlKey) {
        event.preventDefault();
        const { deltaY, clientX, clientY } = event;
        console.log(deltaY);
        const diff = 1 - deltaY;
        rendererHandleRef.current?.onZoom(diff, [clientX, clientY]);
      }
    }
    target.addEventListener('wheel', handleContainerWheel, { passive: false });

    return () => {
      target.removeEventListener('wheel', handleContainerWheel);
    };
  }, []);

  return (
    <div>
      {/* <FlameMiniMap canvasRef={miniMapCanvasRef} width={width} /> */}
      <canvas ref={miniMapCanvasRef} style={{ width, height: 100 }} />
      <div style={{ position: 'relative' }}>
        <canvas ref={framesCanvasRef} style={canvasStyle} />
        <canvas ref={effectCanvasRef} style={canvasStyle} />
        <canvas ref={foregroundCanvasRef} style={canvasStyle} />
        <div
          ref={interventionRef}
          style={canvasStyle}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerOut={handlePointerOut}
          onContextMenu={handleContextMenu}
        ></div>
        <GraphTooltip
          floatingRef={floating}
          node={isFiexedTooltip ? fixedNode : hoveredNode}
          isFixed={isFiexedTooltip}
          onUnFixed={() => setIsFixedTooltip(false)}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
          }}
        >
          {tooltipContent}
        </GraphTooltip>
      </div>
    </div>
  );
};

function useRendererWorker() {
  const { data } = useFlameGraphNodes();
  const { ratio, width, height } = useFlameGraphViewConfig();
  const [isRenderReady, setIsRenderReady] = React.useState(false);
  const [isInitiating, setIsInitiating] = React.useState(false);
  const framesCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const miniMapCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const rendererProxyRef =
    React.useRef<Comlink.Remote<FlameCanvasRendererExports>>();
  const [handle, setHandle] = React.useState<CanvasRendererHandle>();

  React.useEffect(() => {
    const worker = new Worker('/client/flame.worker.js');
    const graphRenderer = Comlink.wrap<FlameCanvasRendererExports>(worker);
    rendererProxyRef.current = graphRenderer;

    return () => {
      console.log('useRendererWorker unmounted');
      rendererProxyRef.current?.destory();
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!rendererProxyRef.current) return;
    rendererProxyRef.current?.updateProps({
      data,
      ratio,
      width,
      height,
    });
  }, [data, ratio, width, height]);

  React.useEffect(() => {
    async function effect() {
      if (
        isRenderReady ||
        // run transferControlToOffscreen for once, more for bug
        isInitiating ||
        !rendererProxyRef.current ||
        !framesCanvasRef.current ||
        !effectCanvasRef.current ||
        !foregroundCanvasRef.current ||
        !miniMapCanvasRef.current
      ) {
        return;
      }
      setIsInitiating(true);
      const framesOffscreenCanvas =
        framesCanvasRef.current.transferControlToOffscreen();
      const effectOffscreenCanvas =
        effectCanvasRef.current.transferControlToOffscreen();
      const foregroundOffscreenCanvas =
        foregroundCanvasRef.current.transferControlToOffscreen();
      const miniMapOffscreenCanvas =
        miniMapCanvasRef.current.transferControlToOffscreen();
      const props: CanvasRendererProps = {
        data,
        ratio,
        framesCanvas: framesOffscreenCanvas,
        effectCanvas: effectOffscreenCanvas,
        foregroundCanvas: foregroundOffscreenCanvas,
        miniMapCanvas: miniMapOffscreenCanvas,
        width,
        height,
      };

      await rendererProxyRef.current.subscribe(
        Comlink.proxy({
          type: 'handle',
          cb: (handle) => {
            setHandle(() => handle);
          },
        })
      );

      await rendererProxyRef.current.init(
        Comlink.transfer(props, [
          framesOffscreenCanvas,
          effectOffscreenCanvas,
          foregroundOffscreenCanvas,
          miniMapOffscreenCanvas,
        ])
      );
    }
    effect();
    setIsRenderReady(true);
    return () => {
      // rendererProxyRef.current?.destory()
    };
  }, [data, ratio, width, height, isRenderReady, isInitiating]);

  return {
    framesCanvasRef,
    effectCanvasRef,
    foregroundCanvasRef,
    miniMapCanvasRef,
    handle,
  };
}

export default FlameGraphWrapper;
