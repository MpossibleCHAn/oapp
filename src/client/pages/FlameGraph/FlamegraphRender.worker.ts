import * as React from 'react';
import * as Comlink from 'comlink';
import { CanvasRendererProps } from './types';
import { create, ReactTestRenderer } from 'react-test-renderer';
import useRenderFrames from './useRenderFrames';

function Renderer(props: CanvasRendererProps) {
  // console.log(props);
  const { data, ratio, framesCanvas, canvasWidth, canvasHeight } = props;
  const ctx = React.useMemo(
    () => framesCanvas.getContext('2d'),
    [framesCanvas]
  );
	const renderFrames = useRenderFrames(props)

  React.useEffect(() => {
		console.log(canvasWidth, canvasHeight, ratio);

    framesCanvas.width = canvasWidth * ratio;
    framesCanvas.height = canvasHeight * ratio;
  }, [canvasWidth, canvasHeight, framesCanvas]);

	// React.useLayoutEffect(() => {
	// 	function render() {
	// 		renderFrames()
	// 	}
	// 	const animationID = requestAnimationFrame(render)
	// 	return () => {
	// 		console.log('---------------');
	// 		cancelAnimationFrame(animationID)
	// 	}
	// }, [renderFrames])

  React.useEffect(() => {
		renderFrames()
  }, [renderFrames]);

  return null;
}

let instance: ReactTestRenderer;
let latestProps: CanvasRendererProps | undefined;

const flameGraphRender = {
  init(props: CanvasRendererProps) {
    console.log('....init');
		latestProps = props
		instance = create(React.createElement(Renderer, props));
  },
	updateProps(updator: Partial<CanvasRendererProps>) {
		if (!latestProps) {
			return
		}
		Object.assign(latestProps, updator)
		instance.update(React.createElement(Renderer, latestProps))
	},
  destory() {
    instance.unmount();
  },
};

Comlink.expose(flameGraphRender);
