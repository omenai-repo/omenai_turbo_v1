import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

export function MarkerWithOpenPopup({
  position,
  icon,
  message,
}: {
  position: [number, number];
  icon?: L.Icon;
  message: string;
}) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.openPopup();
    }
  }, [map]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      <Popup
        autoClose={false}
        closeOnClick={false}
        className="custom-leaflet-popup"
      >
        {message}
      </Popup>
    </Marker>
  );
}
