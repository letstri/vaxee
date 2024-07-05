<script setup lang="ts">
onServerPrefetch(() => {
  testStore.count = 10;
});
const {
  count: countDestructure,
  increment: incrementDestructure,
  double: doubleDestructure,
  users,
} = useTestStore();

await users.suspense();

const testStore = useTestStore(false);
const count = useTestStore("count");
const double = useTestStore("double");
const increment = useTestStore("increment");

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
watch(doubleDestructure, () => {
  console.log("doubleDestructure", doubleDestructure.value);
});
watch(double, () => {
  console.log("double", double.value);
});
watch(count, () => {
  console.log("count", count.value);
  setTimeout(() => {
    console.log("---");
  }, 0);
});

const refresh = () => {
  users.refresh();
};
</script>

<template>
  {{ users }}
  <button @click="refresh"></button>
  <pre>
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
</pre
  >
  <table>
    <tbody>
      <tr>
        <th>count actions</th>
        <th>count state</th>
        <th>count getters</th>
      </tr>
      <tr>
        <td>
          <pre>const testStore = useTestStore(false);</pre>
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
          <pre>const { increment } = useTestStore();</pre>
          <button @click="incrementDestructure">
            <code>increment()</code>
          </button>
        </td>
        <td>
          <pre>const testStore = useTestStore(false);</pre>
          <code>testStore.count: {{ testStore.count }}</code>
          <hr />
          <pre>const count = useTestStore("count");</pre>
          <code>count: {{ count }}</code>
          <hr />
          <pre>const { count } = useTestStore();</pre>
          <code>count: {{ countDestructure }}</code>
        </td>
        <td>
          <pre>const testStore = useTestStore(false);</pre>
          <code>testStore.double: {{ testStore.double }}</code>
          <hr />
          <pre>const { double } = useTestStore();</pre>
          <code>double: {{ doubleDestructure }}</code>
          <hr />
          <pre>const double = useTestStore('double');</pre>
          <code>double: {{ double }}</code>
        </td>
      </tr>
    </tbody>
  </table>
</template>
