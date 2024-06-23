<script setup lang="ts">
onServerPrefetch(() => {
  testStore.count = 10;
});

const { count: countDestructure, increment: incrementDestructure } =
  useTestStore(true);
const testStore = useTestStore();
const count = useTestStore("count");
const countGetter = useTestStore((c) => c.count);
const countGetterSetter = useTestStore({
  get: (state) => state.count,
  set: (state, value) => (state.count = value),
});

const increment = useTestStore("increment");
const incrementGetter = useTestStore((c) => c.increment);

watch(
  () => testStore.count,
  () => {
    console.log("testStore.count", testStore.count);
  }
);
watch(
  () => count.value,
  () => {
    console.log("() => count.value", count.value);
  }
);
watch(countDestructure, () => {
  console.log("countDestructure", countDestructure.value);
});
watch(countGetterSetter, () => {
  console.log("countGetterSetter", countGetterSetter.value);
});
watch(count, () => {
  console.log("count", count.value);
  setTimeout(() => {
    console.log("---");
  }, 0);
});
</script>

<template>
  <pre>
const useTestStore = defineStore("test", () => ({
  count: 0,
  increment() {
    this.count++;
  },
}));</pre
  >
  <button @click="testStore.$reset"><code>testStore.$reset()</code></button
  ><br />
  <button @click="testStore.$state.count++">
    <code>testStore.$state.count++</code></button
  ><br />
  <button @click="testStore.$actions.increment">
    <code>testStore.$actions.increment()</code>
  </button>
  <table>
    <tbody>
      <tr>
        <th>count actions</th>
        <th>count getters</th>
      </tr>
      <tr>
        <td>
          <pre>const testStore = useTestStore();</pre>
          <button @click="testStore.count++">
            <code>testStore.count++</code>
          </button>
          <button @click="testStore.increment">
            <code>testStore.increment()</code>
          </button>
          <hr />
          <pre>const count = useTestStore("count");</pre>
          <button @click="count++"><code>count++</code></button>
          <hr />
          <pre>const increment = useTestStore("increment");</pre>
          <button @click="increment"><code>increment()</code></button>
          <hr />
          <pre>const increment = useTestStore((c) => c.increment);</pre>
          <button @click="incrementGetter">
            <code>increment()</code>
          </button>
          <hr />
          <pre>const { increment } = useTestStore(true);</pre>
          <button @click="incrementDestructure">
            <code>increment()</code>
          </button>
          <hr />
          <pre>
const count = useTestStore({
  get: (state) => state.count,
  set: (state, value) => (state.count = value),
});</pre
          >
          <button @click="countGetterSetter++">
            <code>count++</code>
          </button>
        </td>
        <td>
          <pre>const testStore = useTestStore();</pre>
          <code>testStore.count: {{ testStore.count }}</code>
          <hr />
          <pre>const count = useTestStore("count");</pre>
          <code>count: {{ count }}</code>
          <hr />
          <pre>const count = useTestStore((c) => c.count);</pre>
          <code>count: {{ countGetter }}</code>
          <hr />
          <pre>const { count } = useTestStore(true);</pre>
          <code>count: {{ countDestructure }}</code>
          <hr />
          <pre>
const count = useTestStore({
  get: (state) => state.count,
  set: (state, value) => (state.count = value),
});</pre
          >
          <code>count: {{ countGetterSetter }}</code>
        </td>
      </tr>
    </tbody>
  </table>
</template>
