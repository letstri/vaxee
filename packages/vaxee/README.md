<p align="center">
<a href="https://vaxee.letstri.dev" target="_blank" rel="noopener noreferrer">
<img height="70" src="https://vaxee.letstri.dev/logo.svg"  alt="Nixle logo">
</a>
</p>
<p  align="center">
<strong>The State Manager for Vue 3</strong><br>Store your data across whole application
</p>
<p align="center">
<a href="https://www.npmjs.com/package/vaxee"><img  src="https://img.shields.io/npm/v/vaxee.svg?style=for-the-badge"></a>
<a href="https://nixle.letstri.dev"><img  src="https://img.shields.io/badge/you_want-vaxee-green?style=for-the-badge"></a>
</p>

## Overview

Vaxee is a simple and easy-to-use library for Vue 3 to manage the state of your application.

- ✨ Simple and intuitive API.
- 💪 Incredible TypeScript support.
- 🤯 Includes a `request` function.
- 🫡 Improved DX with reactivity.

## Documentation

You can find the documentation and installation steps [on the website](https://vaxee.letstri.dev).

## Demo

Let's create a huge demo store with a user and auth logic.

```ts
import { createStore } from "vaxee";
import { fetchUser, signIn, parseJwt } from "~/user";

export const useUserStore = createStore(
  "user",
  ({ state, getter, request }) => {
    const tokens = state(
      {
        access: "",
        refresh: "",
      },
      {
        persist: "user.tokens",
      }
    );
    const isAuthorized = getter(
      () => tokens.value.access && tokens.value.refresh
    );
    const userId = getter(() => parseJwt(tokens.value.access).sub);

    const signIn = async (email: string, password: string) => {
      tokens.value = await signIn(email, password);
    };

    const user = request(() => fetchUser(userId.value));

    return {
      user,
      isAuthorized,
    };
  }
);
```

Now, let's use this store in a component.

```vue
<script setup>
import { watch } from "vue";
import { useUserStore } from "../stores/user";

const {
  isAuthorized,
  user: { data: user, refresh: refreshUser },
} = useUserStore();

watch(isAuthorized, (isAuthorized) => {
  if (isAuthorized) {
    refreshUser();
  }
});
</script>

<template>
  <div>
    <p>Authorized: {{ isAuthorized }}</p>
    <p>User: {{ user.firstName }} {{ user.lastName }}</p>
  </div>
</template>
```

## Author

© [letstri](https://letstri.dev), released under the [MIT](https://github.com/letstri/vaxee/blob/main/LICENSE) license.
