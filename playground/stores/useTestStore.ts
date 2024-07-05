export const useTestStore = createStore("test", ({ state, getter, query }) => {
  const count = state(0);
  const double = getter(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  const users = query(async () => {
    return fetch("https://jsonplaceholder.typicode.com/users").then(
      (res) =>
        res.json() as Promise<
          {
            id: number;
            name: string;
            username: string;
            email: string;
          }[]
        >
    );
  });

  return {
    count,
    increment,
    double,
    users,
  };
});
