# parallel

```jsx
const counterNode = createNode("counter", 0, {
  increment: (state) => state + 1,
  decrement: (state) => state - 1
});

function MyCounterControls({ id }) {
  const { increment, decrement } = useNodeActions(counterNode, id);

  return (
    <div>
      counter {id} controls:
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

function MyCounter({ id }) {
  const count = useNodeReader(counterNode, id);

  return (
    <div>
      counter {id}: {count}
    </div>
  );
}

function App() { 
  return (
    <div>
      <MyCounterControls id="1" />
      <MyCounterControls id="2" />
      <MyCounter id="1" />
      <MyCounter id="2" />
     </div>
  )
}
