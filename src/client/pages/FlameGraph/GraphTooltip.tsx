import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { usePortals } from '../../hooks/usePortals';
import { FlameNode } from './types';
import { ensureElement } from './utils';

interface GraphTooltipProps {
  node?: FlameNode;
  floatingRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  children?: React.ReactNode;
}

const GraphTooltip = (props: GraphTooltipProps) => {
  const { node, floatingRef, style, children } = props;

  const tooltipMaxWidth = (window.innerWidth / 3) * 2;
  const tooltipStyle: React.CSSProperties = {
    background: 'rgb(30 41 59)',
    color: 'rgb(255 255 255)',
    fontSizeAdjust: '14px',
    fontWeight: 'bold',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '80%',
    pointerEvents: 'none',
    fontFamily: 'Roboto',
    maxWidth: tooltipMaxWidth,
  };

  const content: React.ReactNode = React.useMemo(() => {
    const contentElement = ensureElement(children, 'div');
    if (contentElement) {
      return contentElement;
    }
    if (!node) return null;
    const { name, data } = node;
    const values = { internal: data.internal, cumulative: data.cumulative };
    return (
      <div>
        {name}
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  }, [children, node]);

  const tooltip = node && (
    <div ref={floatingRef} style={{ ...tooltipStyle, ...style }}>
      {content}
    </div>
  );
  const target = usePortals('root');
  return ReactDOM.createPortal(tooltip, target);
};

export default GraphTooltip;
