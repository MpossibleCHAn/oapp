import * as React from 'react';
import {
  useFlamegraphNodes,
  useFlamegraphViewConfig,
} from './FlamegraphContext';
import { Color, FontSize, Sizes } from './style';
import { FlameNode } from './types';
import useCanvas from './useCanvas';
import useDrawRects from './useDrawRect';
import useDrawText from './useDrawText';
import {
  generateColor,
  hashEntry,
  trimTextMid,
  useCacheMeasureTextWidth,
} from './utils';

interface FlamegraphContainerProps {
  style: React.CSSProperties;
}

const FlamegraphContainer = (props: FlamegraphContainerProps) => {
  const { data } = useFlamegraphNodes();
  const { ratio, canvasWidth, canvasHeight } = useFlamegraphViewConfig();

  const [hoveredNode, setHoveredNode] = React.useState<FlameNode | null>(null);
  const prevHoveredFlameNode = React.useRef<FlameNode>(null);
  const canvasRef = useCanvas();
  const ctx = React.useMemo(() => canvasRef.current?.getContext('2d'), []);
  console.log(ctx);

  const drawText = ctx && useDrawText(ctx);

  // const cacheMeasureTextWidth = useCacheMeasureTextWidth(
  //   canvasRef.current?.getContext('2d'),
  //   ratio
  // );

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!canvasRef.current || !ctx || !canvasWidth || !canvasHeight) {
      return;
    }
    console.log(drawText, 444);

    for (const node of data) {
      const { name, position } = node;
      // console.log(position);

      const rectColor = generateColor(hashEntry(name));
      ctx.fillStyle = rectColor;
      ctx.fillRect(
        position[0][0],
        position[0][1],
        position[1][0] - position[0][0],
        position[1][1] - position[0][1]
      );
      ctx.lineWidth = 1.5 * ratio;
      if (node.id === hoveredNode?.id) {
        ctx.strokeStyle = '#000';
        const offset = 0 * ratio;
        ctx.strokeRect(
          position[0][0],
          position[0][1],
          position[1][0] - position[0][0] - offset,
          position[1][1] - position[0][1] - offset
        );
      } else {
        ctx.strokeStyle = Color.RectBorder;
        ctx.strokeRect(
          position[0][0],
          position[0][1],
          position[1][0] - position[0][0],
          position[1][1] - position[0][1]
        );
      }
      if (drawText) {
        drawText(node);
      }
      // const trimedText = trimTextMid(
      //   ctx,
      //   name,
      //   Math.floor(position[1][0] - position[0][0]) -
      //     Sizes.LabelPaddingX * 4 * ratio
      // );

      // ctx.font = `400 ${FontSize.LABEL * ratio}px Roboto`;
      // ctx.fillStyle = Color.Label;
      // ctx.fillText(
      //   trimedText.trimmedString,
      //   position[0][0] + Sizes.LabelPaddingX * ratio,
      //   position[0][1] + Sizes.LabelVerticalOffset * ratio
      // );
    }
  }, [data, canvasWidth, canvasHeight, drawText]);

  return (
    <div style={props.style}>
      {/* <pre>{hoveredNode?.name}</pre> */}
      <canvas
        id="flamegraph"
        ref={canvasRef}
        style={{ width: canvasWidth, height: canvasHeight }}
      />
    </div>
  );
};

export default FlamegraphContainer;
