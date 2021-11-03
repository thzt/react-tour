import { useState, memo } from 'react';

const App = () => {
  debugger;
  return <div>
    <FnComp />
  </div>
};

const FnComp = () => {
  debugger;
  const [state, setState] = useState(0);
  debugger;

  const onDivClick = () => {
    debugger;
    setState(state + 1);
    debugger;
  };

  return <div onClick={onDivClick}>
    <MemoFnComp />
  </div>;
};

const MemoFnComp = memo(() => {
  debugger;
  return 'memo fn comp';
});

export default App;
