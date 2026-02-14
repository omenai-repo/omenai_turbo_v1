"use client";

import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import arc from "arc";
import { MarkerWithOpenPopup } from "./MapMarker";
import { ShipmentCoords } from "@omenai/shared-types";

// 1. Create Custom CSS Icons (No external images = No broken markers)
const createPulseIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12], // Center the icon
    popupAnchor: [0, -20],
  });
};

const originIcon = createPulseIcon("#3b82f6"); // Blue
const destinationIcon = createPulseIcon("#10b981"); // Emerald

const getCoords = (
  coordinates: ShipmentCoords | null,
  environment: string,
): { origin: [number, number]; destination: [number, number] } => {
  if (environment === "production" && coordinates) {
    return {
      origin: [coordinates.origin.lat, coordinates.origin.lng],
      destination: [coordinates.destination.lat, coordinates.destination.lng],
    };
  }
  return {
    origin: [41.8781, -87.6298], // Chicago
    destination: [6.5244, 3.3792], // Lagos
  };
};

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
    // Added padding to ensure markers aren't on the very edge
    map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 1.5 });
  }, [map, origin, destination]);

  return null;
}

export default function MapView({
  coordinates,
  destinationCity,
  originCity,
}: {
  coordinates: ShipmentCoords | null;
  destinationCity: string;
  originCity: string;
}) {
  const environment = process.env.APP_ENV as string;
  const { origin, destination } = getCoords(coordinates, environment);

  const arcPoints = useMemo(() => {
    try {
      const gc = new arc.GreatCircle(
        { x: origin[1], y: origin[0] },
        { x: destination[1], y: destination[0] },
      );
      const arcLine = gc.Arc(100);
      return arcLine.geometries[0].coords.map(([lng, lat]) => [lat, lng]) as [
        number,
        number,
      ][];
    } catch (e) {
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
          // Switched to a lighter, cleaner map style that fits the UI better
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Added keys to Markers: 
            This forces React Leaflet to re-render them if coordinates change 
        */}
        <MarkerWithOpenPopup
          key={`origin-${origin[0]}-${origin[1]}`}
          position={origin}
          icon={originIcon}
          message={`Origin: ${originCity}`}
        />

        <MarkerWithOpenPopup
          key={`dest-${destination[0]}-${destination[1]}`}
          position={destination}
          icon={destinationIcon}
          message={`Destination: ${destinationCity}`}
        />
        <Polyline
          pathOptions={{
            color: "#3b82f6",
            weight: 3,
            opacity: 0.6,
            dashArray: "10, 10",
            lineCap: "round",
          }}
          positions={arcPoints}
        />

        <FitBounds origin={origin} destination={destination} />
      </MapContainer>
    </div>
  );
}
