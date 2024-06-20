<script setup lang="ts">
import { useStore } from "~/stores/test";

const increment = useStore((s) => s.increment);
const count = useStore((s) => s.count);

onMounted(() => {
  console.log(increment, count);
});
</script>

<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>
