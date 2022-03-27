import * as React from 'react';

interface FlameMiniMapProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
}

const FlameMiniMap = (props: FlameMiniMapProps) => {
  const { canvasRef, width } = props;

  return (
    <div>
      <div style={{ border: '1px solid' }}>
        <canvas ref={canvasRef} style={{ width, height: 100 }} />
      </div>
    </div>
  );
};

export default FlameMiniMap;
