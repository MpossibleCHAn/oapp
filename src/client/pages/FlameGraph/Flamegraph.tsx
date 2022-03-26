import * as React from 'react';
import * as Comlink from 'comlink';
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
  FlameRawTreeNode,
} from './types';

const GRAPH_MIN_WIDTH = 240;

export interface FlameGraphProps {
  data: FlameRawTreeNode;
  isReverse?: boolean;
  ratio?: number;
  getNodeValue?: ([next, value]: [FlameRawTreeNode, number]) => number;
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
  const { ratio, width, height } = useFlameGraphViewConfig();
  const rendererProxyRef =
    React.useRef<Comlink.Remote<FlameCanvasRendererExports>>();

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  };

  const { framesCanvasRef, effectCanvasRef, foregroundCanvasRef, handle } =
    useRendererWorker();

  const rendererHandleRef = React.useRef(handle);
  rendererHandleRef.current = handle;

  const handlePointerMove = React.useCallback((event: React.PointerEvent) => {
    const { nativeEvent } = event;
    const { offsetX, offsetY } = nativeEvent;
    rendererHandleRef.current?.onPointerMove([offsetX, offsetY]);
  }, []);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      console.log(event.currentTarget.getBoundingClientRect());
      const { nativeEvent } = event;
      const { offsetX, offsetY } = nativeEvent;
      rendererHandleRef.current?.onPointerDown([offsetX, offsetY]);
    },
    []
  );

  const handlePointerOut = React.useCallback(
    (event: React.PointerEvent<HTMLHeadElement>) => {
      console.log(event);
    },
    []
  );

  return (
    <div>
      <canvas ref={framesCanvasRef} style={canvasStyle} />
      <canvas ref={effectCanvasRef} style={canvasStyle} />
      <canvas ref={foregroundCanvasRef} style={canvasStyle} />
      <div
        style={canvasStyle}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerOut={handlePointerOut}
      ></div>
    </div>
  );

  // return (
  //   <div
  //     ref={containerRef}
  //     style={{ position: 'relative', display: 'grid', width: '100%' }}
  //   >
  //     <FlamegraphContextProvider
  //       data={data}
  //       ratio={ratio}
  //       canvasWidth={rect.width}
  //     >
  //       {/* <FlamegraphForeground style={{ ...contentStyle, zIndex: 2 }} />
  //       <FlamegraphContainer style={{ ...contentStyle, zIndex: 1 }} /> */}
  //     </FlamegraphContextProvider>
  //   </div>
  // );
};

function useRendererWorker() {
  const { data } = useFlameGraphNodes();
  const { ratio, width, height } = useFlameGraphViewConfig();
  const [isRenderReady, setIsRenderReady] = React.useState(false);
  const [isInitiating, setIsInitiating] = React.useState(false);
  const framesCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = React.useRef<HTMLCanvasElement>(null);
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
        !foregroundCanvasRef.current
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
      const props: CanvasRendererProps = {
        data,
        ratio,
        framesCanvas: framesOffscreenCanvas,
        effectCanvas: effectOffscreenCanvas,
        foregroundCanvas: foregroundOffscreenCanvas,
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
    handle,
  };
}

export default FlameGraphWrapper;
