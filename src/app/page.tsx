
"use client";
import ComplaintStatusHistory from "@/components/ComplaintStatusHistory";

import { useState } from "react";
import dynamic from "next/dynamic";

const ComplaintMap = dynamic(
  () => import("@/components/ComplaintMap"),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>,
  }
);
const PublicComplaintMap = dynamic(
  () => import("@/components/PublicComplaintMap"),
  {
    ssr: false,
    loading: () => <p>Loading public complaint map...</p>,
  }
);


export default function Home() {
  const [message, setMessage] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    ""
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const complaint = {
  title: String(formData.get("title") ?? ""),
  category: String(formData.get("category") ?? ""),
  location: String(formData.get("location") ?? ""),
  description: String(formData.get("description") ?? ""),
  latitude,
  longitude,
};
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaint),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your complaint."
        );
      }

      setMessage(
        `Complaint submitted successfully! Your complaint ID is ${result.complaint.id}.`
      );
      setMessageType("success");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categories = [
    {
      name: "Air Pollution",
      description: "Smoke, dust and poor air quality",
      icon: "🌫️",
    },
    {
      name: "Water Problems",
      description: "Water supply, leakage and contamination",
      icon: "💧",
    },
    {
      name: "Waste & Garbage",
      description: "Uncollected waste and overflowing bins",
      icon: "🗑️",
    },
    {
      name: "Public Issues",
      description: "Road damage, streetlights and other issues",
      icon: "🏙️",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#home" className="text-xl font-bold text-green-800">
            Namma Tamil Nadu
          </a>

          <nav className="flex gap-5 text-sm font-medium sm:gap-8">
            <a href="#home" className="hover:text-green-700">
              Home
            </a>
            <a href="#categories" className="hover:text-green-700">
              Categories
            </a>
            <a href="#report" className="hover:text-green-700">
              Report an Issue
            </a>
            <a href="#about" className="hidden hover:text-green-700 sm:block">
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section
        id="home"
        className="bg-gradient-to-br from-green-900 to-green-700 text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <p className="mb-4 font-semibold uppercase tracking-widest text-green-200">
            Your Voice. Your Community.
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Together, We Can Improve Tamil Nadu
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
            Report public problems in your area and help bring attention to
            the issues that matter to your community.
          </p>

          <a
            href="#report"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-green-900 transition hover:bg-green-50"
          >
            Report a Problem
          </a>
        </div>
      </section>
      <PublicComplaintMap />
      <ComplaintStatusHistory />

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="font-semibold text-green-700">ISSUE CATEGORIES</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            What needs to be fixed?
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Choose the type of public problem you want to report.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#report"
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-green-600 hover:shadow-lg"
            >
              <span className="text-4xl" aria-hidden="true">
                {category.icon}
              </span>

              <h3 className="mt-4 text-lg font-bold">{category.name}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Complaint form */}
      <section id="report" className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <p className="font-semibold text-green-700">MAKE A DIFFERENCE</p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Report a Public Problem
            </h2>

            <p className="mt-4 text-slate-600">
              Explain the problem so your community can bring attention to it.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="title"
                className="mb-2 block font-semibold"
              >
                Complaint Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                placeholder="Example: Garbage not collected"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-semibold"
              >
                Category *
              </label>

              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Air Pollution">Air Pollution</option>
                <option value="Water Problems">Water Problems</option>
                <option value="Waste & Garbage">Waste & Garbage</option>
                <option value="Public Issues">Public Issues</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Streetlights">Streetlights</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block font-semibold"
              >
                Location *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                required
                maxLength={1000}
                placeholder="Enter your town, district or area"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
  <label className="mb-2 block font-semibold">
    Select Complaint Location on Map
  </label>

  <ComplaintMap
    onLocationSelect={(selectedLatitude, selectedLongitude) => {
      setLatitude(selectedLatitude);
      setLongitude(selectedLongitude);
    }}
  />

  {latitude !== null && longitude !== null && (
    <p className="mt-2 text-sm text-green-700">
      Location selected: {latitude.toFixed(5)}, {longitude.toFixed(5)}
    </p>
  )}
</div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block font-semibold"
              >
                Describe the Problem *
              </label>

              <textarea
                id="description"
                name="description"
                required
                rows={5}
                maxLength={10000}
                placeholder="Explain what happened, where it happened and why it needs attention..."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-lg p-4 text-sm font-medium ${
                  messageType === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-800 px-6 py-4 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              Your complaint will be saved in this project&apos;s database
              when the database connection is working. This website does not
              automatically send complaints to government departments.
            </p>
          </form>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-slate-100 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">About Namma Tamil Nadu</h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Namma Tamil Nadu is a public complaint platform concept designed
            to help people report local problems, share information and make
            community issues easier to identify.
          </p>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            This is an early-stage project. Complaints are not yet reviewed
            by government officials, and official complaint tracking is not
            available yet.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-8 text-center text-sm text-slate-300">
        <p className="font-semibold text-white">Namma Tamil Nadu</p>
        <p className="mt-2">
          A community project for a better Tamil Nadu.
        </p>
        <p className="mt-4">
         © 2026 Namma Tamil Nadu. Project prototype.
        </p>
      </footer>
    </main>
  );
}