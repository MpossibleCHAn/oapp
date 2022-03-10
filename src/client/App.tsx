import * as React from "react";
import Home from "./Home";
import { Nav } from "./Nav";

const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <Nav />
      <Home />
    </div>
  );
};

export default App;
