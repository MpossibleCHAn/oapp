import * as React from 'react';
import useResizeObserver from '../../hooks/useResizeObserver';
import FlamegraphContainer from './FlamegraphContainer';
import {
  FlameGraphContextProvider,
  useFlameGraphNodes,
  useFlameGraphViewConfig,
} from './FlamegraphContext';
import FlamegraphForeground from './FlamegraphForeground';
import {
  CanvasRendererProps,
  FlameCanvasRendererExports,
  FlameRawTreeNode,
} from './types';
import * as Comlink from 'comlink';
import useCanvas from './useCanvas';

const GRAPH_MIN_WIDTH = 240;

export interface FlameGraphProps {
  data: FlameRawTreeNode;
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
      <FlameGraphContextProvider
        data={data}
        ratio={ratio}
        canvasWidth={rect.width}
      >
        {/* {rect.width >= GRAPH_MIN_WIDTH && <FlameGraph {...props} />} */}
        <FlameGraph {...props} />
      </FlameGraphContextProvider>
    </div>
  );
};

const FlameGraph = (props: FlameGraphProps) => {
  const { ratio, canvasWidth, canvasHeight } = useFlameGraphViewConfig();
  const rendererProxyRef =
    React.useRef<Comlink.Remote<FlameCanvasRendererExports>>();

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: canvasWidth,
    height: canvasHeight,
  };

  const { framesCanvasRef, effectCanvasRef, foregroundCanvasRef } =
    useRendererWorker();

  return (
    <div>
      <div>hello</div>
      <canvas ref={framesCanvasRef} style={canvasStyle} />
      <canvas ref={effectCanvasRef} style={canvasStyle} />
      <canvas ref={foregroundCanvasRef} style={canvasStyle} />
    </div>
  );

  return <div>hello</div>;

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
  const { ratio, canvasWidth, canvasHeight } = useFlameGraphViewConfig();
  const framesCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const rendererProxyRef =
    React.useRef<Comlink.Remote<FlameCanvasRendererExports>>();

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
    if (!rendererProxyRef.current) return
    rendererProxyRef.current?.updateProps({
      ratio,
      canvasWidth,
      canvasHeight
    })
  }, [ratio, canvasWidth,canvasHeight])

  React.useEffect(() => {
    async function effect() {
      if (
        !rendererProxyRef.current ||
        !framesCanvasRef.current ||
        !effectCanvasRef.current ||
        !foregroundCanvasRef.current
      ) {
        return;
      }
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
        canvasWidth,
        canvasHeight,
      };
      await rendererProxyRef.current.init(
        Comlink.transfer(props, [
          framesOffscreenCanvas,
          effectOffscreenCanvas,
          foregroundOffscreenCanvas,
        ])
      );
    }
    effect();
    return () => {
      // rendererProxyRef.current?.destory()
    }
  }, [data, ratio, canvasWidth, canvasHeight]);

  return {
    framesCanvasRef,
    effectCanvasRef,
    foregroundCanvasRef,
  };
}

export default FlameGraphWrapper;
