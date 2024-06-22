export const useTestStore = defineStore("test", ({ getter }) => ({
  count: 0,
  increment() {
    this.count++;
  },
  test: getter((state) => state.count),
}));
