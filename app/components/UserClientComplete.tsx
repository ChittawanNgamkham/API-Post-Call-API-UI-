"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string | null;
  email: string;
};

type Post = {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number;
  author?: User;
};

export default function UsersClientComplete() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [postsError, setPostsError] = useState<string | null>(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postForUser, setPostForUser] = useState<User | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postFormError, setPostFormError] = useState<string | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
  }

  async function loadPosts() {
    const res = await fetch("/api/post");
    const data = (await res.json().catch(() => null)) as unknown;

    if (!res.ok) {
      const message =
        typeof (data as { error?: unknown } | null)?.error === "string"
          ? (data as { error: string }).error
          : "Failed to load posts";
      setPostsError(message);
      return;
    }

    setPostsError(null);
    setPosts(Array.isArray(data) ? (data as Post[]) : []);
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
        body: JSON.stringify({
          id: editingId,
          name,
          email,
        }),
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

  function openPostModal(user: User) {
    setPostForUser(user);
    setPostTitle("");
    setPostContent("");
    setPostFormError(null);
    setIsPostModalOpen(true);
  }

  function closePostModal() {
    setIsPostModalOpen(false);
    setPostForUser(null);
    setPostTitle("");
    setPostContent("");
    setPostFormError(null);
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();

    if (!postForUser) return;

    setIsSavingPost(true);
    setPostFormError(null);

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          authorId: postForUser.id,
        }),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (!res.ok) {
        const message =
          typeof (data as { error?: unknown } | null)?.error === "string"
            ? (data as { error: string }).error
            : "Failed to create post";
        setPostFormError(message);
        return;
      }

      closePostModal();
      loadPosts();
    } finally {
      setIsSavingPost(false);
    }
  }

  async function removePost(id: number) {
    const res = await fetch(`/api/post?id=${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as unknown;
      const message =
        typeof (data as { error?: unknown } | null)?.error === "string"
          ? (data as { error: string }).error
          : "Failed to delete post";
      setPostsError(message);
      return;
    }

    loadPosts();
  }

  function edit(user: User) {
    setEditingId(user.id);
    setName(user.name ?? "");
    setEmail(user.email);
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadUsers();
      await loadPosts();
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-2xl mx-auto">

        {/* Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8">

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            {editingId ? "✏️ Edit User" : "➕ Add User"}
          </h2>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 
                           text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 
                           text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className={`flex-1 py-2 rounded-lg text-white font-medium transition
                  ${
                    editingId
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >

                {editingId ? "Update User" : "Add User"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setEmail("");
                  }}
                  className="flex-1 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <hr className="my-8" />

          {/* User List */}
          <h2 className="text-xl font-semibold mb-4 text-gray-900">User List</h2>

          <ul className="space-y-3">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex justify-between items-center bg-gray-50 
                           border rounded-xl p-4 hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {u.name || "(no name)"}
                  </p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPostModal(u)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 
                               text-white rounded-lg text-sm transition"
                  >
                    Post
                  </button>

                  <button
                    onClick={() => edit(u)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 
                               text-white rounded-lg text-sm transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => remove(u.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 
                               text-white rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <hr className="my-8" />

          {/* Post List */}
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Post List</h2>

          {postsError && (
            <p className="text-sm text-red-600 mb-3">{postsError}</p>
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-start bg-gray-50 
                             border rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 break-words">
                      {p.title}
                    </p>

                    {p.content ? (
                      <p className="text-sm text-gray-600 mt-1 break-words">
                        {p.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1 italic">
                        No content
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Author:{" "}
                      {p.author?.name ||
                        p.author?.email ||
                        `User #${p.authorId}`}
                    </p>
                  </div>

                  <button
                    onClick={() => removePost(p.id)}
                    className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 
                               text-white rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && postForUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-1">Create Post</h3>
            <p className="text-sm text-gray-600 mb-4">
              For:{" "}
              <span className="font-medium text-gray-800">
                {postForUser.name || postForUser.email}
              </span>
            </p>

            {postFormError && (
              <p className="text-sm text-red-600 mb-3">{postFormError}</p>
            )}

            <form onSubmit={submitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 
                             text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Enter title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Content (optional)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 
                             text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Enter content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closePostModal}
                  className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPost}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white transition"
                >
                  {isSavingPost ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
