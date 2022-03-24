import * as React from 'react';
import { useFlameGraphViewConfig } from './FlamegraphContext';

const useCanvas = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { ratio, canvasWidth, canvasHeight } = useFlameGraphViewConfig();

  React.useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasWidth * ratio;
      canvasRef.current.height = canvasHeight * ratio;
    }
  }, [ratio, canvasWidth, canvasHeight]);

  return canvasRef;
};

export default useCanvas;
