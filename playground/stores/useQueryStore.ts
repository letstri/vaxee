export const useQueryStore = createStore("query", ({ query }) => {
  const users = query<
    {
      id: number;
      name: string;
      username: string;
      email: string;
    }[]
  >(async () => {
    return fetch("https://jsonplaceholder.typicode.com/users").then((res) =>
      res.json()
    );
  });

  return {
    users,
  };
});
