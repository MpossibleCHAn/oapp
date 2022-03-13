import * as React from "react";

const Home = () => {
  const [count, setCount] = React.useState(0)
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(prev => prev + 1)}>click</button>
    </div>
  );
};

export default Home;
