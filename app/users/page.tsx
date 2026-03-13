type User = {
  id: number;
  name: string | null;
  email: string;
};

async function getUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:3000/api/users", {
    cache: "no-store",
  });

  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div style={{ padding: 20 }}>
      <h1>Users</h1>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <b>{u.name}</b> – {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
