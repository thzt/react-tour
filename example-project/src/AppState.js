import { useState } from 'react';

const App = () => {
  debugger;
  const [state, setState] = useState(0);
  debugger;

  const onDivClick = () => {
    debugger;
    setState(1);
    debugger;
  };
  return <div onClick={onDivClick}>
    {state}
  </div>
};

export default App;
