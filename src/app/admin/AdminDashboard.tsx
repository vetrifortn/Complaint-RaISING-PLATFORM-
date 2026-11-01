"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Complaint = {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchComplaints(): Promise<Complaint[]> {
    const response = await fetch("/api/admin/complaints");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not load complaints.");
    }

    return data.complaints;
  }

  async function loadComplaints() {
    setLoading(true);
    setError("");

    try {
      setComplaints(await fetchComplaints());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const response = await fetch("/api/admin/logout", { method: "POST" });

    if (!response.ok) {
      setError("Could not log out. Please try again.");
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    let active = true;

    async function loadInitialComplaints() {
      try {
        setComplaints(await fetchComplaints());
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialComplaints();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-600">NAMMA TAMIL NADU</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <button
              onClick={logout}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Logout
            </button>
            <p className="mt-2 text-gray-600">
              Review and manage public complaints.
            </p>
          </div>

          <button
            onClick={loadComplaints}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Refresh Complaints
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Total Complaints</p>
            <p className="mt-2 text-3xl font-bold">{complaints.length}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {complaints.filter((item) => item.status === "pending").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Resolved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {complaints.filter((item) => item.status === "resolved").length}
            </p>
          </div>
        </div>

        {loading && <p className="text-gray-600">Loading complaints...</p>}

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Complaint</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-t">
                    <td className="p-4">#{complaint.id}</td>
                    <td className="p-4 font-medium">{complaint.title}</td>
                    <td className="p-4">{complaint.category}</td>
                    <td className="p-4">{complaint.location}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}