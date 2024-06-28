export const useTestStore = createStore("test", ({ state, getter }) => {
  const count = state(0);

  return {
    count,
    increment() {
      count.value++;
    },
    double: getter(() => count.value * 2),
  };
});
