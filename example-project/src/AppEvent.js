import { useState } from 'react';

const App = () => {
  debugger;
  const [, setState] = useState(0);
  debugger;

  const onDivClick = () => {
    debugger;
    setState(1);
    debugger;
  };

  return <div onClick={onDivClick}>
    hello world
  </div>
};

export default App;
