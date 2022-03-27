import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { usePortals } from '../../hooks/usePortals';
import { FlameNode } from './types';
import { ensureElement } from './utils';
import { Icon } from '@iconify/react';
import pinOff16Filled from '@iconify/icons-fluent/pin-off-16-filled';

interface GraphTooltipProps {
  node?: FlameNode;
  floatingRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  children?: React.ReactNode;
  isFixed: boolean;
  onUnFixed: () => void;
}

const pinStyle: React.CSSProperties = {
  display: 'grid',
  position: 'absolute',
  top: -12,
  left: -12,
  width: 18,
  height: 18,
  padding: 4,
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgb(30 41 59)',
  borderRadius: 12,
  cursor: 'pointer',
};

const GraphTooltip = (props: GraphTooltipProps) => {
  const { node, floatingRef, style, isFixed, onUnFixed, children } = props;

  const tooltipMaxWidth = (window.innerWidth / 3) * 2;
  const tooltipStyle: React.CSSProperties = React.useMemo(() => {
    return {
      position: 'relative',
      background: 'rgb(30 41 59)',
      color: 'rgb(255 255 255)',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '80%',
      fontFamily: 'monospace, "system-ui"',
      minWidth: 320,
      maxWidth: tooltipMaxWidth,
    };
  }, [tooltipMaxWidth]);

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

  const tooltip = (isFixed || node) && (
    <div ref={floatingRef} style={{ ...tooltipStyle, ...style }}>
      {isFixed && (
        <div style={pinStyle} title="unfixed" onClick={onUnFixed}>
          <Icon icon={pinOff16Filled} />
        </div>
      )}
      {content}
    </div>
  );
  const target = usePortals('root');
  return ReactDOM.createPortal(tooltip, target);
};

export default GraphTooltip;
