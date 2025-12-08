"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import arc from "arc";

import L from "leaflet";
import { MarkerWithOpenPopup } from "./MapMarker";

// // Fix missing marker icons (optional but common)
const icon = L.icon({
  iconUrl: "https://img.icons8.com/color/48/marker--v1.png", // from public folder
  iconSize: [48, 48],
  iconAnchor: [23, 46],
  popupAnchor: [0, -32],
});

const destinationIcon = L.icon({
  iconUrl: "https://img.icons8.com/color/48/marker--v1.png", // remote
  iconSize: [48, 48],
  iconAnchor: [23, 46],
  popupAnchor: [0, -32],
});

const origin: [number, number] = [41.8781, -87.6298]; // Illinois
const destination: [number, number] = [6.5244, 3.3792]; // Lagos

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [100, 100] });
  }, []);

  return null;
}

export default function MapView() {
  // Generate arc points using `arc`
  const arcPoints = useMemo(() => {
    const gc = new arc.GreatCircle(
      { x: origin[1], y: origin[0] }, // [lng, lat]
      { x: destination[1], y: destination[0] }
    );
    const arcLine = gc.Arc(100); // 100 intermediate points
    return arcLine.geometries[0].coords.map(([lng, lat]) => [lat, lng]) as [
      number,
      number,
    ][];
  }, []);

  return (
    <MapContainer
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      center={origin}
      zoom={2}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      <MarkerWithOpenPopup
        position={origin}
        icon={icon}
        message="Origin: Illinois, USA"
      />

      <MarkerWithOpenPopup
        position={destination}
        icon={destinationIcon}
        message="Destination: Lagos, Nigeria"
      />

      <Polyline
        pathOptions={{ color: "#00bfff", weight: 2 }}
        positions={arcPoints}
      />

      <FitBounds />
    </MapContainer>
  );
}
