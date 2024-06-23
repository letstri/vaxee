export const useTestStore = defineStore("test", () => ({
  count: 0,
  increment() {
    this.count++;
  },
  // $getter: () => this.count,
}));
