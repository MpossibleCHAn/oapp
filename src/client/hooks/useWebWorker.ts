import * as React from "react";
import * as Comlink from "comlink";

export interface useWebWorkerOptions {
  count: number;
  init: (count: number) => void;
}
export interface workerExports {
  count: number;
  increate: (count: number) => number;
}

export default function useWebWorker() {
  const [count, setCount] = React.useState(0);
	const [worker, ] = React.useState(() => {
    const worker = new Worker("/client/worker.js");
    const obj = Comlink.wrap<workerExports>(worker);
		return obj
	})
  React.useEffect(() => {
    async function effect() {
			const newCount = await worker.increate(count)
      setCount(newCount);
    }
		let id = setInterval(() => {
    	effect();
		}, 2000)
		return () => {
			clearInterval(id)
		}
  }, [count, worker]);

  return count;
}
