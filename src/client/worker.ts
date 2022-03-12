import * as Comlink from "comlink"
import { workerExports } from "./hooks/useWebWorker";

const data: workerExports ={
	count: 99,
	increate: (count: number) => {
		console.log(count);
		return count + 10
	}
}
Comlink.expose(data)
