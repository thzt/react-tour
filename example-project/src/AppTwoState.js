import { useState } from 'react';

const App = () => {
  debugger;
  const [state1, setState1] = useState(0);
  debugger;
  const [state2, setState2] = useState('a');
  debugger;

  const onDivClick = () => {
    debugger;
    setState1(1);
    debugger;
    setState2('b');
    debugger;
  };

  debugger;
  return <div onClick={onDivClick}>
    {state1}-{state2}
  </div>;
}

export default App;
