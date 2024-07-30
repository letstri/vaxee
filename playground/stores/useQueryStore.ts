interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export const useQueryStore = createStore("query", ({ query }) => {
  const users = query<User[]>(async ({ signal }) => {
    return fetch("https://jsonplaceholder.typicode.com/users", {
      signal,
    }).then((res) => res.json());
  });

  return {
    users,
  };
});
