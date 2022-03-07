import * as React from "react";
import { Nav } from "./Nav";

const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <Nav />
    </div>
  );
};

export default App;
