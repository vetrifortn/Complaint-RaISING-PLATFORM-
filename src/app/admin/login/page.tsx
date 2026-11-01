"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = "/admin";
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Admin Login
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Sign in to manage public complaints.
        </p>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3"
          required
        />

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3"
          required
        />

        {message && (
          <p className="mb-4 text-sm text-red-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}