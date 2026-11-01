"use client";

import { useState } from "react";

type HistoryItem = {
  old_status: string | null;
  new_status: string;
  changed_at: string;
  note: string | null;
};

type ComplaintData = {
  id: number;
  title: string;
  status: string;
};

export default function ComplaintStatusHistory() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchComplaint() {
    if (!complaintId.trim()) {
      setError("Please enter a complaint ID.");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setHistory([]);

    try {
      const response = await fetch(
        `/api/complaints/${encodeURIComponent(complaintId.trim())}/history`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not find complaint.");
      }

      setComplaint(data.complaint);
      setHistory(data.history);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatStatus(status: string) {
    return status.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
  }

  function statusColor(status: string) {
    if (status === "resolved") return "bg-green-100 text-green-700";
    if (status === "in_progress") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  }

  return (
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-center text-3xl font-bold text-gray-900">
          Track Your Complaint
        </h2>

        <p className="mb-8 text-center text-gray-600">
          Enter your complaint ID to check its latest status and progress.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            min="1"
            value={complaintId}
            onChange={(event) => setComplaintId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") searchComplaint();
            }}
            placeholder="Enter complaint ID, e.g. 2"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={searchComplaint}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Complaint"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {complaint && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-sm text-gray-500">
                Complaint #{complaint.id}
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-900">
                {complaint.title}
              </h3>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusColor(
                  complaint.status
                )}`}
              >
                {formatStatus(complaint.status)}
              </span>
            </div>

            <h4 className="mb-5 text-lg font-semibold text-gray-900">
              Status History
            </h4>

            {history.length === 0 ? (
              <p className="text-gray-600">
                No status updates have been recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {history.map((item, index) => (
                  <div
                    key={`${item.changed_at}-${index}`}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-4 rounded-full bg-blue-600" />
                      {index !== history.length - 1 && (
                        <div className="mt-2 h-full min-h-12 w-0.5 bg-gray-200" />
                      )}
                    </div>

                    <div className="pb-2">
                      <p className="font-semibold text-gray-900">
                        {formatStatus(item.new_status)}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(item.changed_at).toLocaleString()}
                      </p>

                      {item.note && (
                        <p className="mt-2 text-gray-700">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}