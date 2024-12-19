---
outline: deep
---

# Request

Vaxee provides a `request` function to fetch data and store it in the store. Also `request` provides a way to cache the data and several options to enhance the data fetching process. **Cache** is stored in the store and is **shared** between all components that use the store. That means if you fetch the data in one component, it will be available in another component without fetching it again.

::: tip
If you are using server-side rendering (SSR), it is recommended to read the [SSR section](#ssr) to avoid hydration errors.
:::

## Create a Request

To create a request, use the `request` function from the `createStore` callback.

```ts
import { createStore } from "vaxee";
import { fetchUser } from "../api/user";

export const useUserStore = createStore("user", ({ request }) => {
  const user = request(() => fetchUser(1));

  return {
    user,
  };
});
```

This small example includes **caching** the data, **error handling** and loading **states**. Now each call of `useUserStore` won't trigger a new request to the server. Instead, it will return the **cached data**.

### Parameters

The `request` function accepts a function that returns a promise. This function provides arguments that can be used to customize the behavior of the request.

```ts
interface VaxeeRequestParams {
  signal: AbortSignal;
}
```

#### `signal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) object is used to automatically abort the request when the request is sent multiple times.

```ts
const useUsersStore = createStore("users", ({ request }) => {
  const users = request(({ signal }) =>
    fetch("/users", { signal }).then((res) => res.json())
  );

  return { users };
});
```

### Options

You can pass options to the `request` function to customize the behavior.

```ts
interface VaxeeRequestOptions {
  mode?: "auto" | "lazy" | "manual";
  watch?: WatchSource[];
  onError?: <E = unknown>(error: E) => any;
}
```

#### `mode`

- `auto` - The request will be sent automatically on **server-side**, if available, with `onServerPrefetch` hook. Also the request will be sent automatically on the client-side if did not send on the server-side.
- `client` - The request will be sent automatically **only** on the **client-side**.
- `manual` - If you want control the request **manually**, you can set the `mode` to `manual` and request won't be sent automatically.

> Default: `auto`

#### `watch`

You can pass an array of `state` objects or `getter` properties or a function that returns a value to watch. If the value changes, the request will be refreshed.

```ts
const useUserStore = createStore("user", ({ request, state }) => {
  const token = state("");
  const user = request(
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

#### `onError`

You can pass a function that will be called when an error occurs.

```ts
const useUserStore = createStore("user", ({ request }) => {
  const user = request(() => fetchUser(), {
    onError: (error) => {
      console.error(error);
    },
  });

  return { user };
});
```

## Use a Request

Let's use this request in a component.

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
} = await useUserStore("user");

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

// ❌ it will work but you'll get the same if mode is "auto"
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

The `request` function returns an promiseable object with the following properties:

- `data` - The data returned from the request. It's a `ref` object.
- `error` - The error returned from the request. It's a `ref` object.
- `status` - The status of the request. It's a `ref` object. It can be one of the following values:
- `execute` - A function that sends the request and clears the data.
- `refresh` - A function that refreshes the request without clearing the data.
- `suspense` - A function that waiting for the promise to resolve. It's useful for server-side rendering (SSR).
- `onSuccess` - A function that is called when the request is successful.
- `onError` - A function that is called when the request fails.

```ts
enum VaxeeRequestStatus {
  NotFetched = "not-fetched",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}
```
