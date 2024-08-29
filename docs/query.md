---
outline: deep
---

# Query

Vaxee provides a `query` function to fetch data and store it in the store. Also `query` provides a way to cache the data and several options to enhance the data fetching process. **Cache** is stored in the store and is **shared** between all components that use the store. That means if you fetch the data in one component, it will be available in another component without fetching it again.

::: tip
If you are using server-side rendering (SSR), it is recommended to read the [SSR section](#ssr-1) to avoid hydration errors.
:::

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
  watch?: WatchSource[];
  ssr?: boolean;
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

#### `watch`

You can pass an array of `state` objects or `getter` properties or a function that returns a value to watch. If the value changes, the query will be refreshed.

```ts
const useUserStore = createStore("user", ({ query, state }) => {
  const token = state("");
  const user = query(
    () => {
      if (!token.value) return null;

      return fetchUser();
    },
    {
      watch: [token],
    }
  );

  return { token, user };
});
```

#### `ssr`

By default, the query is automatically sent on the server-side if available. You can pass a `boolean` property that determines whether the query should be sent on the server-side rendering. If `false`, the query will be automatically sent only on the client-side.

> Default is `true`.

```ts
const useUserStore = createStore("user", ({ query }) => {
  const user = query(() => fetchUser(), {
    ssr: false,
  });

  return { user };
});
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
  data: user,
  error: userError,
  status: userStatus,
  execute: executeUser,
  refresh: refreshUser,
  suspense: suspenseUser,
  onSuccess: onUserSuccess,
  onError: onUserError,
} = useUserStore("user");

onUserSuccess((user) => {
  console.log("User fetched successfully", user);
});

onUserError((error) => {
  console.error("User fetch failed", error);
});

onMounted(() => {
  setInterval(() => {
    refreshUser();
  }, 5000);
});

// Or you can use it directly:
// const store = useUserStore.reactive();
// store.user.data

onServerPrefetch(async () => {
  await suspenseUser();
});
</script>

<template>
  <div v-if="userStatus === 'fetching'">Loading...</div>
  <div v-else-if="userStatus === 'error'">Error: {{ userError.message }}</div>
  <div v-else>
    Refreshing: {{ userStatus === "refreshing" }}<br />
    <p>User ID: {{ user.id }}</p>
    <p>User Name: {{ user.name }}</p>
    <p>User Email: {{ user.email }}</p>
  </div>
</template>
```

### Properties

The `query` function returns an object with the following properties:

- `data` - The data returned from the query. It's a `ref` object.
- `error` - The error returned from the query. It's a `ref` object.
- `status` - The status of the query. It's a `ref` object. It can be one of the following values:
- `execute` - A function that sends the query and clears the data.
- `refresh` - A function that refreshes the query without clearing the data.
- `suspense` - A function that waiting for the promise to resolve. It's useful for server-side rendering (SSR).
- `onSuccess` - A function that is called when the query is successful.
- `onError` - A function that is called when the query fails.

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

::: warning
If you are not using `suspense`/`execute`/`refresh` in SSR to wait for the data to resolve, the request will be **send twice** due to the client-side rendering, which can lead to hydration errors. Use these functions to wait to the query promise resolve, so it won't be fetched again on the client-side. If you want to fetch the data only on the **client-side**, you need to [disable](#ssr) the `ssr` option.
:::

::: tip
The `suspense` function is **not** responsible for **fetching data**, even if you call it multiple times. Its purpose is to allow you to wait for the promise inside the `query` function to resolve. To fetch the data, you need to call the `execute` or `refresh` function.
:::

```ts
import { useUserStore } from "../stores/user";

const {
  user: { suspense: userSuspense },
} = useUserStore();

/**
 * Wait the data resolving on the server only when the component is visible on the rendered page.
 * It won't be fetched on the client side after router navigation.
 *
 * @see https://vuejs.org/api/composition-api-lifecycle#onserverprefetch
 */
onServerPrefetch(async () => {
  await userSuspense();
});

/**
 * Wait the data resolving every time the component is rendered.
 *
 * @see https://vuejs.org/guide/built-ins/suspense.html#async-dependencies
 */
await userSuspense();
```
