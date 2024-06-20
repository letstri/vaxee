<script setup lang="ts">
const store = useStore();

onServerPrefetch(() => {
  store.count = 20;
});
</script>

<template>
  <Vaxee />
  <hr />
  store directly
  <div>
    {{ store.count }}
  </div>
  <button @click="store.increment">click 2</button>
</template>
