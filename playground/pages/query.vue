<script setup lang="ts">
const {
  users: { data: users, refresh, suspense, status },
} = useQueryStore();

await suspense();

const store = useQueryStore.reactive();
</script>

<template>
  <table>
    <tbody>
      <tr>
        <th>Destructuring</th>
        <th>Direct via store</th>
      </tr>
      <tr>
        <td>
          <button @click="refresh">Refresh</button>
          <hr />
          {{ status }}

          <div v-for="user in users">
            <pre>{{ user }}</pre>
          </div>
        </td>
        <td>
          <button @click="store.users.refresh">Refresh</button>
          <hr />
          {{ store.users.status }}

          <div v-for="user in store.users.data">
            <pre>{{ user }}</pre>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
