"use client";

import { useState, useEffect } from "react";

// --- Types ---
interface ArtConfig {
  top: string;
  left: string;
  width: string;
}

interface RoomTemplate {
  id: string;
  name: string;
  image: string;
  artConfig: ArtConfig;
}

interface RoomViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artUrl: string;
}

// --- Configuration ---
const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "gallery-bench",
    name: "White Gallery w/ Bench",
    image: "/scenes/scene.jpg",
    artConfig: { top: "43.3%", left: "51%", width: "25%" },
  },
  {
    id: "gallery-industrial",
    name: "Industrial Space",
    image: "/scenes/scene.jpg",
    artConfig: { top: "40%", left: "50%", width: "30%" },
  },
  {
    id: "gallery-dark",
    name: "Dark Exhibition",
    image: "/scenes/scene.jpg",
    artConfig: { top: "45%", left: "50%", width: "20%" },
  },
];

export default function RoomViewModal({
  isOpen,
  onClose,
  artUrl,
}: RoomViewModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomTemplate>(
    ROOM_TEMPLATES[0],
  );

  // Prevent scrolling the background page when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // 1. The Backdrop (Fixed, Full Screen, Dark)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90  backdrop-blur-sm"
      onClick={onClose} // Close when clicking the dark background
    >
      {/* 2. The Modal Container */}
      <div
        className="relative w-full max-w-full flex flex-col gap-6 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
      >
        {/* Header: Title & Close Button */}
        <div className="flex justify-between items-center text-white">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 transition-colors"
          >
            {/* Simple Close Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 3. The Room Visualization (Reused Logic) */}
        <div className="relative w-full overflow-hidden shadow-2xl bg-gray-800">
          <img
            src={selectedRoom.image}
            alt="Room Preview"
            className="w-full h-auto max-h-[70vh] object-contain mx-auto" // Added max-h to prevent scrolling on small screens
          />

          <div
            className="absolute shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out"
            style={{
              top: selectedRoom.artConfig.top,
              left: selectedRoom.artConfig.left,
              width: selectedRoom.artConfig.width,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="bg-white p-[2%]">
              <img
                src={artUrl}
                alt="Artwork"
                className="w-full h-full block object-contain"
              />
            </div>
          </div>
        </div>

        {/* 4. Room Switcher (Floating at bottom) */}
        <div className="flex justify-center w-full gap-3 overflow-x-auto pb-2">
          {ROOM_TEMPLATES.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={` text-sm font-medium whitespace-nowrap transition-all ${
                selectedRoom.id === room.id
                  ? "bg-white text-black scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
