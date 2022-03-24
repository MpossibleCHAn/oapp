import * as React from 'react'
import { CanvasRendererProps } from './types';

function useRenderEffect(props: CanvasRendererProps) {

	const { data, framesCanvas, ratio } = props;
  const ctx = React.useMemo(
    () => framesCanvas.getContext('2d'),
    [framesCanvas]
  );

	const renderEffect = React.useCallback(() => {
		if (!ctx)	return


	}, [])

	React.useEffect(() => {

	}, [ctx])

	return null
}

export default useRenderEffect
