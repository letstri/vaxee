---
outline: deep
---

# Query

Vaxee provides a `query` function to fetch data and store it in the store. Also `query` provides a way to cache the data and several options to enhance the data fetching process.

## Create a Query

To create a query, use the `query` function from the `createStore` callback.

```ts
import { createStore } from "vaxee";
import { fetchUser } from "../api/user";

export const useUserStore = createStore("user", ({ query }) => {
  const user = query(() => fetchUser(1));

  return {
    user,
  };
});
```

This small example includes **caching** the data, **error handling** and loading **states**. Now each call of `useUserStore` won't trigger a new request to the server. Instead, it will return the **cached data**.

## Usage

Let's use this query in a component.

```vue
<script setup>
import { useUserStore } from "../stores/user";

const {
  user: { data: user, status: userStatus, error: userError },
} = useUserStore();

// Or you can use it directly:
// const store = useUserStore(false);
// store.user.data
</script>

<template>
  <div v-if="userStatus === 'pending'">Loading...</div>
  <div v-else-if="userStatus === 'error'">Error: {{ userError.message }}</div>
  <div v-else>
    <p>User ID: {{ user.data.id }}</p>
    <p>User Name: {{ user.data.name }}</p>
    <p>User Email: {{ user.data.email }}</p>
  </div>
</template>
```

## SSR

If you are using some server-side rendering (SSR) framework, you can use the `suspense` function to fetch the data before rendering the component.

```ts
import { useUserStore } from "../stores/user";

const {
  user: { suspense: userSuspense },
} = useUserStore();

onServerPrefetch(async () => {
  await userSuspense();
});
```

### Nuxt

If you are using the Nuxt, you can use the `suspense` function directly in the component.

```ts
import { useUserStore } from "../stores/user";

const {
  user: { suspense: userSuspense },
} = useUserStore();

await userSuspense();
```
