export const useTestStore = createStore("test", ({ state, getter }) => {
  const count = state(0);

  const double = getter(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return {
    count,
    increment,
    double,
  };
});
