
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

type Complaint = {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
};

const categories = [
  "All",
  "Waste & Garbage",
  "Water Problems",
  "Air Pollution",
  "Public Issues",
];

function getCategoryIcon(category: string) {
  const colors: Record<string, string> = {
    "Waste & Garbage": "#ef4444",
    "Water Problems": "#3b82f6",
    "Air Pollution": "#f97316",
    "Public Issues": "#22c55e",
  };

  const color = colors[category] || "#6b7280";

  return L.divIcon({
    className: "custom-complaint-marker",
    html: `<div style="
      background-color: ${color};
      width: 22px;
      height: 22px;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function FitMapToComplaints({
  complaints,
}: {
  complaints: Complaint[];
}) {
  const map = useMap();

  useEffect(() => {
    if (complaints.length === 0) return;

    const coordinates = complaints.map(
      (complaint) =>
        [complaint.latitude, complaint.longitude] as [number, number]
    );

    map.fitBounds(coordinates, {
      padding: [50, 50],
      maxZoom: 10,
    });
  }, [complaints, map]);

  return null;
}

export default function PublicComplaintMap() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredComplaints =
    selectedCategory === "All"
      ? complaints
      : complaints.filter(
          (complaint) => complaint.category === selectedCategory
        );

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const response = await fetch("/api/complaints");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Could not load complaints.");
        }

        setComplaints(data.complaints);
      } catch {
        setError("Unable to load complaint locations.");
      } finally {
        setLoading(false);
      }
    }

    fetchComplaints();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-green-700">
          Explore Your Community
        </p>

        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Public Complaint Map
        </h2>

        <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-600">
          Explore reported public problems across Tamil Nadu and see
          where communities need attention.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              selectedCategory === category
                ? "border-green-700 bg-green-700 text-white shadow-md"
                : "border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50"
            }`}
          >
            {category === "All" ? "All Complaints" : category}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-8 text-center text-gray-600">
          Loading complaints...
        </p>
      )}

      {error && (
        <p className="py-8 text-center text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-600">
              Showing{" "}
              <span className="font-bold text-green-700">
                {filteredComplaints.length}
              </span>{" "}
              complaint(s) with map locations
            </p>

            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800">
              {selectedCategory === "All"
                ? "All categories"
                : selectedCategory}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
            <div className="overflow-hidden rounded-xl">
              <MapContainer
                center={[10.7905, 78.7047]}
                zoom={7}
                scrollWheelZoom={true}
                style={{ height: "500px", width: "100%" }}
              >
                <FitMapToComplaints complaints={filteredComplaints} />

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredComplaints.map((complaint) => (
                  <Marker
                    key={complaint.id}
                    position={[
                      complaint.latitude,
                      complaint.longitude,
                    ]}
                    icon={getCategoryIcon(complaint.category)}
                  >
                    <Popup>
                      <div className="min-w-48">
                        <h3 className="font-bold">{complaint.title}</h3>

                        <p className="mt-1">
                          Category: {complaint.category}
                        </p>

                        <p>Location: {complaint.location}</p>
                        <p>Status: {complaint.status}</p>

                        <p className="mt-2 text-sm">
                          {complaint.description}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

