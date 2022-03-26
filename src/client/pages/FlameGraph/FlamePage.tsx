import * as React from 'react';
import FlameGraph from './FlameGraph';
import data from './data6';
import { FlameRawTreeNode } from './types';

const FlamePage = () => {
  const root = {
    // root: [data.flame_all.tree, data.flame_all.num],
    root: [data.flame_vm.tree, data.flame_vm.num],
  } as unknown as FlameRawTreeNode;
  return (
    // <div style={{ marginTop: 500, marginLeft: 400 }}>
    <div>
      <FlameGraph data={root} />
    </div>
  );
};
export default FlamePage;
