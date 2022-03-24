import * as React from "react";

const Home = () => {
  const [count, setCount] = React.useState(0)

  const handleClick = React.useCallback(() => {
    console.log(count);
    setCount(prev => prev + 1)
  }, [])

  React.useEffect(() => {
    console.log(count)
    let timer = setInterval(() => {
      console.log(count)
    }, 1000)
  }, [count])

  return (
    <div>
      <div>{count}</div>
      <button onClick={handleClick}>Click</button>
    </div>
  );
};

export default Home;
