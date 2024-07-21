<script setup lang="ts">
onServerPrefetch(() => {
  // stateGettersStore.count = 10;
});

const {
  count: countDestructure,
  increment: incrementDestructure,
  double: doubleDestructure,
} = useStateGettersStore();

const stateGettersStore = useStateGettersStore(false);
const count = useStateGettersStore("count");
const double = useStateGettersStore("double");
const increment = useStateGettersStore("increment");

watch(
  () => stateGettersStore.count,
  () => {
    console.log("stateGettersStore.count", stateGettersStore.count);
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
</script>

<template>
  <pre>
export const useStateGettersStore = createStore("test", ({ state, getter }) => {
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
          <pre>const stateGettersStore = useStateGettersStore(false);</pre>
          <button @click="stateGettersStore.count++">
            <code>stateGettersStore.count++</code>
          </button>
          <button @click="stateGettersStore.increment">
            <code>stateGettersStore.increment()</code>
          </button>
          <hr />
          <pre>const count = useStateGettersStore("count");</pre>
          <button @click="count++"><code>count++</code></button>
          <hr />
          <pre>const increment = useStateGettersStore("increment");</pre>
          <button @click="increment"><code>increment()</code></button>
          <hr />
          <pre>const { increment } = useStateGettersStore();</pre>
          <button @click="incrementDestructure">
            <code>increment()</code>
          </button>
        </td>
        <td>
          <pre>const stateGettersStore = useStateGettersStore(false);</pre>
          <code>stateGettersStore.count: {{ stateGettersStore.count }}</code>
          <hr />
          <pre>const count = useStateGettersStore("count");</pre>
          <code>count: {{ count }}</code>
          <hr />
          <pre>const { count } = useStateGettersStore();</pre>
          <code>count: {{ countDestructure }}</code>
        </td>
        <td>
          <pre>const stateGettersStore = useStateGettersStore(false);</pre>
          <code>stateGettersStore.double: {{ stateGettersStore.double }}</code>
          <hr />
          <pre>const { double } = useStateGettersStore();</pre>
          <code>double: {{ doubleDestructure }}</code>
          <hr />
          <pre>const double = useStateGettersStore('double');</pre>
          <code>double: {{ double }}</code>
        </td>
      </tr>
    </tbody>
  </table>
</template>
