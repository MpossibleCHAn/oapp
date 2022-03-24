import * as React from 'react';
import data from './data3';
import Flamegraph from './Flamegraph';
import { FlameRawTreeNode } from './types';

const FlamePage = () => {
  const root = {
    root: [data.flame_all.tree, data.flame_all.num],
  } as unknown as FlameRawTreeNode;
  return (
    <div style={{ margin: 0}}>
      <Flamegraph data={root} />
    </div>
  );
};
export default FlamePage;
