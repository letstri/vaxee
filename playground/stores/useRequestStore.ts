interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export const useRequestStore = createStore("request", ({ request }) => {
  const users = request<User[]>(async ({ signal }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fetch("https://jsonplaceholder.typicode.com/users", {
      signal,
    }).then((res) => res.json());
  });

  return {
    users,
  };
});
