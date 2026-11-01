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
function FitMapToComplaints({ complaints }: { complaints: Complaint[] }) {
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
    <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-5 flex flex-wrap justify-center gap-3">
  {[
    "All",
    "Waste & Garbage",
    "Water Problems",
    "Air Pollution",
    "Public Issues",
  ].map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        selectedCategory === category
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {category === "All" ? "All Complaints" : category}
    </button>
  ))}
</div>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Public Complaint Map
        </h2>

        <p className="mt-2 text-gray-600">
          Explore reported public problems across Tamil Nadu.
        </p>
      </div>

      {loading && (
        <p className="py-8 text-center">Loading complaints...</p>
      )}

      {error && (
        <p className="py-8 text-center text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <>
          <p className="mb-3 text-sm text-gray-600">
            {filteredComplaints.length} complaint(s) with map locations
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-300">
            <MapContainer
              center={[10.7905, 78.7047]}
              zoom={7}
              scrollWheelZoom={true}
              style={{ height: "500px", width: "100%" }}

            ><FitMapToComplaints complaints={complaints} />
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
                      <h3 className="font-bold">
                        {complaint.title}
                      </h3>

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
        </>
      )}
    </section>
  );
}