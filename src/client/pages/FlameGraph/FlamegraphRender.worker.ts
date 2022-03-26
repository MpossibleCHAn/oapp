import * as React from 'react';
import * as Comlink from 'comlink';
import {
  CanvasRendererHandle,
  CanvasRendererProps,
  CanvasRendererSubscriber,
} from './types';
import { create, ReactTestRenderer } from 'react-test-renderer';
import useRenderFrames from './useRenderFrames';
import usePointer from './usePointer';
import useRenderEffect from './useRenderEffect';

const subscribers: Map<string, CanvasRendererSubscriber> = new Map();

function Renderer(props: CanvasRendererProps) {
  const { ratio, framesCanvas, effectCanvas, width, height } = props;

  const { handlePointerMove, handlePointerDown, handlePointerOut, hoveredNode } =
    usePointer(props);
  const renderFrames = useRenderFrames(props);
  const renderEffect = useRenderEffect(props, { hoveredNode });

  React.useLayoutEffect(() => {
    framesCanvas.width = width * ratio;
    framesCanvas.height = height * ratio;
    effectCanvas.width = width * ratio;
    effectCanvas.height = height * ratio;
  }, [width, height, framesCanvas, ratio, effectCanvas]);

  const handle: CanvasRendererHandle = {
    onPointerMove: handlePointerMove,
    onPointerDown: handlePointerDown,
    onPointerOut: handlePointerOut
  };

  const handleRef = React.useRef(handle);
  handleRef.current = handle;

  const stableHandle = React.useMemo(() => {
    console.log('stableHandle');

    const value: CanvasRendererHandle = {
      onPointerMove: (position) => handleRef.current.onPointerMove(position),
      onPointerDown: (position) => handleRef.current.onPointerDown(position),
      onPointerOut: () => handleRef.current.onPointerOut()
    };
    return value;
  }, []);

  React.useEffect(() => {
    for (const subscrier of subscribers.values()) {
      if (subscrier.type !== 'handle') return;
      subscrier.cb(Comlink.proxy(stableHandle));
    }
  }, [stableHandle]);

  // const emitMouseEvent = React.useCallback(() => {
  //   for (const subscrier of subscribers.values()) {
  //     console.log(subscrier);
  //   }
  // }, [])

  // React.useLayoutEffect(() => {
  //   function render() {
  //     renderFrames();
  //   }
  //   const animationID = requestAnimationFrame(render);
  //   return () => {
  //     cancelAnimationFrame(animationID);
  //   };
  // }, [renderFrames]);

  React.useLayoutEffect(() => {
    renderFrames();
  }, [renderFrames]);

  React.useEffect(() => {
    renderEffect();
  }, [renderEffect]);

  return null;
}

let instance: ReactTestRenderer;
let latestProps: CanvasRendererProps | undefined;

const flameGraphRender = {
  init(props: CanvasRendererProps) {
    console.log('....init');
    latestProps = props;
    instance = create(React.createElement(Renderer, props));
  },
  updateProps(updator: Partial<CanvasRendererProps>) {
    if (!latestProps) {
      return;
    }
    Object.assign(latestProps, updator);
    instance.update(React.createElement(Renderer, latestProps));
  },
  async subscribe(subscriber: CanvasRendererSubscriber): Promise<void> {
    console.log(subscriber.type);
    const type = await subscriber.type;
    console.log(type);
    subscribers.set(type, { type, cb: subscriber.cb });
  },
  destory() {
    instance.unmount();
  },
};

Comlink.expose(flameGraphRender);
