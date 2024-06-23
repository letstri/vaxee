export const useTestStore = createStore("test", () => ({
  count: 0,
  increment() {
    // set({ test: 1 });
  },
}));
// useTestStore()
