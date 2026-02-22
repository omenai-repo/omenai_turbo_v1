"use client";

import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import arc from "arc";
import { MarkerWithOpenPopup } from "./MapMarker";

// Safe Icon Creation (Only runs on client)
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:16px;height:16px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
};

// Component to handle bounds
function FitBounds({
  origin,
  destination,
}: {
  origin: [number, number];
  destination: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  }, [map, origin, destination]);
  return null;
}

export default function MapView({
  coordinates,
  destinationCity,
  originCity,
}: any) {
  // Default to London/NY if null (or handle gracefully)
  const origin: [number, number] = coordinates?.origin
    ? [coordinates.origin.lat, coordinates.origin.lng]
    : [51.505, -0.09];
  const destination: [number, number] = coordinates?.destination
    ? [coordinates.destination.lat, coordinates.destination.lng]
    : [40.7128, -74.006];

  const originIcon = createIcon("#3b82f6"); // Blue
  const destIcon = createIcon("#10b981"); // Emerald

  // Calculate Curve
  const arcPoints = useMemo(() => {
    try {
      const gc = new arc.GreatCircle(
        { x: origin[1], y: origin[0] },
        { x: destination[1], y: destination[0] },
      );
      const line = gc.Arc(100);
      return line.geometries[0].coords.map(([lng, lat]: number[]) => [
        lat,
        lng,
      ]);
    } catch {
      return [origin, destination];
    }
  }, [origin, destination]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        center={origin}
        zoom={3}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MarkerWithOpenPopup
          position={origin}
          icon={originIcon}
          message={`Origin: ${originCity}`}
        />
        <MarkerWithOpenPopup
          position={destination}
          icon={destIcon}
          message={`Destination: ${destinationCity}`}
        />

        <Polyline
          pathOptions={{
            color: "#94a3b8",
            weight: 2,
            dashArray: "5, 10",
            opacity: 0.8,
          }}
          positions={arcPoints as any}
        />

        <FitBounds origin={origin} destination={destination} />
      </MapContainer>
    </div>
  );
}
