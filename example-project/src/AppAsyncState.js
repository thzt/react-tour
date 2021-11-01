import { useState } from 'react';

const App = () => {
  debugger;
  const [state, setState] = useState(0);
  debugger;

  const onDivClick = () => {
    debugger;
    setState(s => {
      debugger;
      return s + 1;
    });
    debugger;
    setState(s => {
      debugger;
      return s + 2;
    });
    debugger;
  };

  debugger;
  return <div onClick={onDivClick}>
    {state}
  </div>;
}

export default App;
