import * as React from 'react';
import * as Comlink from 'comlink';
import { workerExports } from '../hooks/useWebWorker';

function Users() {
  const [count, setCount] = React.useState(0);
  const [worker] = React.useState(() => {
    const worker = new Worker('/client/worker.js');
    return Comlink.wrap<workerExports>(worker);
  });

  // console.log(worker);

  React.useEffect(() => {
    async function effect() {
      const data = await worker.increate(count);
      setCount(data);
    }
    const timer = setInterval(() => {
      effect();
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [count]);

  return (
    <div>
      <pre>{count}</pre>
    </div>
  );
}

export default Users;
