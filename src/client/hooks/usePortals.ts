import * as React from 'react';

export function usePortals(id: string) {
  const rootElementRef = React.useRef<HTMLDivElement>(
    document.createElement('div')
  );
  React.useEffect(() => {
    const rootElement = rootElementRef.current;
    const parentElement = document.getElementById(id);
    parentElement?.appendChild(rootElement);
    return () => {
      rootElement.remove();
    };
  }, [id]);

  return rootElementRef.current;
}
