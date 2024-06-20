export const useStore = defineStore("test", () => ({
  count: 0,
  increment() {
    this.count++;
  },
}));
