# SSR

On this page you can find how to use Vaxee with server-side rendering (SSR).

## State

::: warning
If you are using the Nuxt package, you can skip this section. The code below is already included in the Nuxt package.
:::

To use Vaxee with server-side rendering (SSR), you need to use **save** your data before sending it to the client and then restore it on the client side. You can do it by inserting your data into the HTML response.

::: tip
When inserting data into the HTML response, make sure to properly escape it. You can use the [devalue](https://github.com/nuxt-contrib/devalue) package for this purpose.
:::

To restore same data on the client side, you can use the following code.

```ts{8-12}
import { createApp } from "vue";
import App from "./App.vue";
import { createVaxee } from "vaxee";

const vaxee = createVaxee();
const app = createApp(App);

if (typeof window !== "undefined") {
  vaxee.state.value = JSON.parse(
    document.getElementById("__vaxee__").textContent
  );
}

app.use(vaxee);
app.$mount("#app");
```

The main point is to set the `vaxee.state.value` with the data **before using any store**.

## Request

If you are using some server-side rendering (SSR) framework, you also can use the `await` syntax to wait the data before rendering the component.

::: tip
The `suspense` function is **not** responsible for **fetching data**, even if you call it multiple times. Its purpose is to allow you to wait for the promise inside the `request` function to resolve. To fetch the data, you need to call the `execute` or `refresh` function.
:::

```ts
import { useUserStore } from "../stores/user";

/**
 * You can use `await` directly in the component
 * to wait the data resolving every time the component is rendered.
 *
 * @see https://vuejs.org/guide/built-ins/suspense.html#async-dependencies
 */
const { data: user } = await useUserStore("user");

// Or another way to wait the data resolving
const { suspense: userSuspense } = useUserStore("user");

await userSuspense();
```
