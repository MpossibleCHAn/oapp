import * as React from "react";
import Home from "./pages/Home";
import { Nav } from "./pages/Nav";
import * as Comlink from "comlink"
import useWebWorker from "./hooks/useWebWorker";

const App = () => {
  // const [count, setCount] = React.useState(0);

  const count = useWebWorker()


  return (
    <div>
      count: {count}
      {/* <Nav />
      <Home /> */}
    </div>
  );
};

export default App;
