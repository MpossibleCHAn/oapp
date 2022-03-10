import * as React from "react";
import Home from "./pages/Home";
import { Nav } from "./pages/Nav";

const App = () => {
  const [count, setCount] = React.useState(0);


  React.useEffect(() => {
    const worker = new Worker("/client/worker.js")
    console.log(worker);
    worker.postMessage("hihihihi")
    worker.onmessage = (e => {
      console.log(e);
    })
  }, [])

  return (
    <div>
      <Nav />
      <Home />
    </div>
  );
};

export default App;
