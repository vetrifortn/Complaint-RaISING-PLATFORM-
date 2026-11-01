"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

type ComplaintMapProps = {
  onLocationSelect: (latitude: number, longitude: number) => void;
};

function LocationMarker({
  onLocationSelect,
}: ComplaintMapProps) {
  const [position, setPosition] = useState<
    [number, number] | null
  >(null);

  useMapEvents({
    click(event) {
      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

      setPosition([latitude, longitude]);
      onLocationSelect(latitude, longitude);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function ComplaintMap({
  onLocationSelect,
}: ComplaintMapProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-300">
      <p className="bg-white p-3 text-sm text-gray-700">
        Click the map to select the complaint location.
      </p>

      <MapContainer
        center={[10.7905, 78.7047]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}