// components/ShipmentTracker.js
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import arc from "arc";
import { lineString as turfLineString } from "@turf/helpers";

mapboxgl.accessToken =
  "pk.eyJ1Ijoib21lbmFpIiwiYSI6ImNtYTVjcnFkeTBnMG8ybHM0amxtZHphOGgifQ.x8U_EyA0DmyZhrTjWhPDTA";

const origin: [number, number] = [-87.6298, 41.8781]; // Illinois, USA
const destination: [number, number] = [3.3792, 6.5244]; // Lagos, Nigeria

// Example shipment timeline data
const shipmentTimeline = [
  { status: "Order Placed", location: "Origin", time: "2025-05-01T08:00:00Z" },
  {
    status: "Processing at Facility",
    location: "Origin",
    time: "2025-05-01T10:30:00Z",
  },
  {
    status: "Departed Origin Facility",
    location: "Illinois, USA",
    time: "2025-05-01T14:00:00Z",
  },
  { status: "In Transit", location: "", time: "2025-05-02T09:00:00Z" },
  {
    status: "Arrived at Destination Facility",
    location: "Lagos, Nigeria",
    time: "2025-05-03T11:15:00Z",
  },
  {
    status: "Out for Delivery",
    location: "Lagos, Nigeria",
    time: "2025-05-03T14:00:00Z",
  },
  {
    status: "Delivered",
    location: "Lagos, Nigeria",
    time: "2025-05-03T16:30:00Z",
  },
];

const formatDate = (isoString: string | number | Date) => {
  const date = new Date(isoString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const ShipmentTracker = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // To highlight current stage

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: origin,
      zoom: 3,
    });

    map.current.on("load", () => {
      // Great circle route
      const generator = new arc.GreatCircle(
        { x: origin[0], y: origin[1] },
        { x: destination[0], y: destination[1] }
      );
      const arcLine = generator.Arc(100);
      const curvedLine = turfLineString(arcLine.geometries[0].coords);

      if (map.current) {
        map.current.addSource("route", {
          type: "geojson",
          data: curvedLine,
        });
      }

      if (map.current) {
        map.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#00bfff",
            "line-width": 3,
            "line-opacity": 0.7,
          },
        });
      }

      if (map.current) {
        new mapboxgl.Marker({ color: "red" })
          .setLngLat(destination)
          .addTo(map.current);
      }

      if (map.current) {
        map.current.fitBounds([origin, destination], {
          padding: 80,
          duration: 1000,
          linear: true,
        });
      }
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 grid grid-cols-4 w-full">
      {/*  */}
      <div className="\overflow-hidden shadow-md col-span-3">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      <div className="mt-6 col-span-1 p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Tracking Timeline
        </h2>
        <div className="relative">
          <div
            className="absolute top-0 left-6 w-0.5 h-full bg-gray-300"
            aria-hidden="true"
          />
          <ul>
            {shipmentTimeline.map((event, index) => (
              <li key={index} className="mb-6 ml-10">
                <div className="flex space-x-3">
                  <div className="relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      {index <= currentStep && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {event.status}
                    </h3>
                    {event.location && (
                      <p className="text-xs text-gray-500">{event.location}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(event.time)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracker;
