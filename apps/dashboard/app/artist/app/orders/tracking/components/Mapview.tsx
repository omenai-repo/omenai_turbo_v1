"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import arc from "arc";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// // Fix missing marker icons (optional but common)
// delete (L.Icon.Default.prototype as any)._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

const origin: [number, number] = [41.8781, -87.6298]; // Illinois
const destination: [number, number] = [6.5244, 3.3792]; // Lagos

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [50, 50] });
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
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      center={origin}
      zoom={2}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      <Marker position={origin}>
        <Popup>Origin: Illinois, USA</Popup>
      </Marker>

      <Marker position={destination}>
        <Popup>Destination: Lagos, Nigeria</Popup>
      </Marker>

      <Polyline
        pathOptions={{ color: "#00bfff", weight: 2 }}
        positions={arcPoints}
      />

      <FitBounds />
    </MapContainer>
  );
}
