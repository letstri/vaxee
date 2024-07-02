---
outline: deep
---

# Introduction

Having worked on **many** projects and frameworks, I've developed my **own vision** of the perfect state manager for **Vue 3**. After googling for a while and **not finding** anything similar, I decided to create _my own_. By establishing the basic functionality in Vaxee, the features that were missing in other state managers will gradually be added.

## Why Do You Need Vaxee?

If you use **Vue 3** and want to store your _data_ and use it across different _components_ without dealing with _prop drilling_ or _event bus_ issues, then you need _Vaxee_.

Vaxee uses a single `ref` under the hood to store **all the data**. This is similar to creating your own `ref` where you would store all your data and **import** it into each **component**, but we've done that **for you**.

Additionally, Vaxee offers extra functionality in the form of **stores** to help you **divide** all your data into **smaller parts**. Each store is created using a single imported function called `createStore`. Inside the callback of this function, you can use **reactive** variables declared via `state` and their computed parts via `getter`. All this is still stored in a single `ref` variable under the hood.

To **use** the data, we offer many different options that are fully supported by **TypeScript** and simplify the use of any store.

We have moved away from using regular `ref` and `computed` inside the store because we **want** to give you more **control** over the variables, like `persist` or `log`. We will keep adding more functionality **over time**.

## Why Not Pinia?

You can use **Pinia** in two ways, Options API and Composition API. The Options API will be familiar to Vue 2 users, while the Composition API is for Vue 3 users.

Let's consider the **Composition API** approach, which is relevant for the modern Vue **ecosystem**. What's wrong with it? For Vue 3, it's an **ideal** option for creating **components**. Each component has some logic, side effects in the form of `watch` and `onMounted`, but is such logic needed for stores?

### Creation

Having worked on **many** Vue 3 projects, I've **noticed** that some developers attempt to **use** side effects **inside stores**. However, this approach can lead to **issues**, such as the side effects not functioning correctly, as discussed in this [GitHub thread](https://github.com/vuejs/pinia/discussions/1508). Examples of such side effects include `onMounted` or `onServerPrefetch`.

That's why in **Vaxee**, we intentionally avoid incorporating side effects inside stores. This design choice allows all stores to function seamlessly without the need for `effectScope` or the usage of `watch` and similar functionalities.

### Usage

When using stores in Pinia, you might need to use reactive **variables** and **functions** simultaneously. How do you do this in **Pinia**?

```js
const store = useStore();
const { count } = storeToRefs(store);
const { increment } = store;
```

It took us **3 lines** just to get a function and a reactive variable. How do you do this in **Vaxee**?

```js
const { count, increment } = useStore();

// count: Ref<number>;
// increment: () => void;
```

This way, we get a reactive variable and a function. What if we need the data to not be wrapped in a `ref`?

```js
const store = useStore(false);

// store: {
//   count: number;
//   increment: () => void;
// }
```

By adding `false` to the store parameters, we remove unnecessary `ref` in nested variables, and the behavior becomes like in Pinia.

In addition to `boolean`, the store accepts other data types, detailed here.
