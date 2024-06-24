export const useTestStore = createStore("test", {
  count: 0,
  increment() {
    this.count++;
  },
  $double() {
    return this.count * 2;
  },
});
