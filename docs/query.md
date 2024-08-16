---
outline: deep
---

# Query

Vaxee provides a `query` function to fetch data and store it in the store. Also `query` provides a way to cache the data and several options to enhance the data fetching process. **Cache** is stored in the store and is **shared** between all components that use the store. That means if you fetch the data in one component, it will be available in another component without fetching it again.

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

### Parameters

The `query` function accepts a function that returns a promise. This function provides arguments that can be used to customize the behavior of the query.

```ts
interface VaxeeQueryParams {
  signal: AbortSignal;
}
```

#### `signal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) object is used to automatically abort the query when the request is sent multiple times.

```ts
const useUsersStore = createStore("users", ({ query }) => {
  const users = query(({ signal }) =>
    fetch("/users", { signal }).then((res) => res.json())
  );

  return { users };
});
```

### Options

You can pass options to the `query` function to customize the behavior.

```ts
interface VaxeeQueryOptions {
  sendManually?: boolean;
  onError?: <E = unknown>(error: E) => any;
}
```

#### `sendManually`

By default, the query is sent automatically when the store is used. You can pass a `boolean` property that determines whether the query should be sent manually.

> Default is `false`.

```ts
const useUserStore = createStore("user", ({ query }) => {
  const user = query(() => fetchUser(), {
    sendManually: true,
  });

  return { user };
});
```

And then you can call the `execute` function to send the query manually.

```vue
<script setup>
const {
  user: { execute },
} = useUserStore();

onMounted(() => {
  execute();
});
</script>
```

#### `onError`

You can pass a function that will be called when an error occurs.

```ts
const useUserStore = createStore("user", ({ query }) => {
  const user = query(() => fetchUser(), {
    onError: (error) => {
      console.error(error);
    },
  });

  return { user };
});
```

## Use a Query

Let's use this query in a component.

```vue
<script setup>
import { useUserStore } from "../stores/user";

const {
  // user, userStatus, userError are still reactive
  user: {
    data: user,
    status: userStatus,
    error: userError,
    execute: executeUser,
    refresh: refreshUser,
  },
} = useUserStore();

// Or you can use it directly:
// const store = useUserStore.reactive();
// store.user.data
</script>

<template>
  <div v-if="userStatus === 'fetching'">Loading...</div>
  <div v-else-if="userStatus === 'error'">Error: {{ userError.message }}</div>
  <div v-else>
    Refreshing: {{ userStatus === "refreshing" }}<br />
    <p>User ID: {{ user.data.id }}</p>
    <p>User Name: {{ user.data.name }}</p>
    <p>User Email: {{ user.data.email }}</p>
  </div>
</template>
```

### Properties

The `query` function returns an object with the following properties:

- `data` - The data returned from the query. It's a `ref` object.
- `error` - The error returned from the query. It's a `ref` object.
- `execute` - A function that sends the query and clears the data.
- `refresh` - A function that refreshes the query without clearing the data.
- `status` - The status of the query. It's a `ref` object. It can be one of the following values:

```ts
enum VaxeeQueryStatus {
  NotFetched = "not-fetched",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}
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
