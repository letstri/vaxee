export const useTestStore = createStore("test", {
  count: 0,
  increment() {
    this.count++;
  },
  $double() {
    return this.double2;
  },
  $double2() {
    return this.count * 2;
  },
});
