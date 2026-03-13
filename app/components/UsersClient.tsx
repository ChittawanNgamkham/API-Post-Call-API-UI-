"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string | null;
  email: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId === null) {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
    } else {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, email }),
      });
    }

    setName("");
    setEmail("");
    setEditingId(null);
    loadUsers();
  }

  async function remove(id: number) {
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadUsers();
  }

  function edit(user: User) {
    setEditingId(user.id);
    setName(user.name ?? "");
    setEmail(user.email);
  }

  function openPostModal(user: User) {
    setSelectedUser(user);
    setPostTitle("");
    setPostContent("");
    setShowPostModal(true);
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: postTitle,
        content: postContent,
        authorId: selectedUser.id,
      }),
    });

    setShowPostModal(false);
    setPostTitle("");
    setPostContent("");
    setSelectedUser(null);
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadUsers();
    };
    fetchData();
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h2>{editingId ? "Edit User" : "Add User"}</h2>

      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", flex: 1 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", flex: 1 }}
        />
        <button
          type="submit"
          style={{ padding: "6px 14px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setName(""); setEmail(""); }}
            style={{ padding: "6px 14px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </form>

      <hr />

      <h2>User List</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map((u) => (
          <li key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ flex: 1 }}>{u.name || "(no name)"} ({u.email})</span>

            {/* ปุ่ม Post */}
            <button
              onClick={() => openPostModal(u)}
              style={{ padding: "4px 12px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Post
            </button>

            {/* ปุ่ม Edit */}
            <button
              onClick={() => edit(u)}
              style={{ padding: "4px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Edit
            </button>

            {/* ปุ่ม Delete */}
            <button
              onClick={() => remove(u.id)}
              style={{ padding: "4px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Modal สร้าง Post */}
      {showPostModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginTop: 0 }}>
              📝 สร้าง Post สำหรับ <span style={{ color: "#f97316" }}>{selectedUser?.name}</span>
            </h3>

            <form onSubmit={submitPost} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                placeholder="Title *"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
              <textarea
                placeholder="Content (optional)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, resize: "none" }}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{ padding: "8px 16px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
