import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

export function MarkerWithOpenPopup({
  position,
  icon,
  message,
}: {
  position: [number, number];
  icon?: L.DivIcon;
  message: string;
}) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      // Small delay ensures map is ready before opening popup
      setTimeout(() => marker.openPopup(), 500);
    }
  }, [map]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      <Popup
        autoClose={false}
        closeOnClick={false}
        className="font-medium text-slate-800 text-xs"
      >
        {message}
      </Popup>
    </Marker>
  );
}
