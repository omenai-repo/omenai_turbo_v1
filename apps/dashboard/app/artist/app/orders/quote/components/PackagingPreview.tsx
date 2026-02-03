import React from "react";

interface PackagingPreviewProps {
  type: "rolled" | "stretched";
  width: number;
  height: number;
  depth: number;
}

export default function PackagingPreview({
  type,
  width,
  height,
  depth,
}: PackagingPreviewProps) {
  // -- TUBE RENDERER (Updated: Realistic, Longer, No Logo) --
  if (type === "rolled") {
    // Scaling logic to make it look "Longer"
    const scale = 4.2;
    // Visually, the diameter needs to be significant to look good
    const diameter = width * scale * 1.5;
    // We calculate length based on input, but clamp it to fill the viewbox nicely
    // 40" -> ~280px visual width
    const pixelLength = Math.min(Math.max(height * 4, 200), 300);
    const capWidth = 10; // Thickness of the plastic caps

    const vbW = 340;
    const vbH = 220;
    const startX = (vbW - pixelLength) / 2;
    const centerY = 100; // Centered vertically

    return (
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          {/* Main Tube Gradient (White/Grey Spiral Look) */}
          <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" /> {/* Dark Top Edge */}
            <stop offset="20%" stopColor="#ffffff" /> {/* Strong Highlight */}
            <stop offset="50%" stopColor="#f3f4f6" /> {/* Mid Tone */}
            <stop offset="85%" stopColor="#e5e7eb" /> {/* Lower Mid */}
            <stop offset="100%" stopColor="#9ca3af" />{" "}
            {/* Dark Bottom Shadow */}
          </linearGradient>

          {/* End Cap Gradient (Matte Black/Dark Grey Plastic) */}
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="30%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          {/* Spiral Texture Pattern */}
          <pattern
            id="spiralPattern"
            width="40"
            height="100"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(15)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100"
              stroke="#000"
              strokeWidth="1"
              opacity="0.03"
            />
          </pattern>
        </defs>

        {/* -- SHADOW -- */}
        <ellipse
          cx={startX + pixelLength / 2}
          cy={centerY + diameter / 2 + 8}
          rx={pixelLength / 2 - 5}
          ry={6}
          fill="#000"
          opacity="0.2"
          filter="blur(5px)"
        />

        {/* -- TUBE BODY -- */}
        {/* Main Cylinder */}
        <rect
          x={startX}
          y={centerY - diameter / 2}
          width={pixelLength}
          height={diameter}
          fill="url(#tubeGrad)"
        />

        {/* Spiral Texture Overlay */}
        <rect
          x={startX}
          y={centerY - diameter / 2}
          width={pixelLength}
          height={diameter}
          fill="url(#spiralPattern)"
        />

        {/* -- END CAPS -- */}

        {/* LEFT CAP (Back/Hidden Side) */}
        <g>
          {/* The Lip */}
          <path
            d={`M${startX} ${centerY - diameter / 2 - 2} 
                     L${startX + capWidth} ${centerY - diameter / 2 - 2}
                     L${startX + capWidth} ${centerY + diameter / 2 + 2}
                     L${startX} ${centerY + diameter / 2 + 2} Z`}
            fill="url(#capGrad)"
          />
          {/* The End Face */}
          <ellipse
            cx={startX}
            cy={centerY}
            rx={5}
            ry={diameter / 2 + 2}
            fill="#1f2937"
          />
        </g>

        {/* RIGHT CAP (Front/Visible Side) */}
        <g>
          {/* The Lip */}
          <path
            d={`M${startX + pixelLength - capWidth} ${centerY - diameter / 2 - 2} 
                     L${startX + pixelLength} ${centerY - diameter / 2 - 2}
                     L${startX + pixelLength} ${centerY + diameter / 2 + 2}
                     L${startX + pixelLength - capWidth} ${centerY + diameter / 2 + 2} Z`}
            fill="url(#capGrad)"
          />
          {/* The End Face */}
          <ellipse
            cx={startX + pixelLength}
            cy={centerY}
            rx={5}
            ry={diameter / 2 + 2}
            fill="#4b5563"
            stroke="#1f2937"
            strokeWidth="0.5"
          />
          {/* Indent Detail */}
          <ellipse
            cx={startX + pixelLength}
            cy={centerY}
            rx={2}
            ry={diameter / 3}
            fill="#1f2937"
            opacity="0.4"
          />
        </g>

        {/* -- DIMENSION LINES -- */}

        {/* Length Line (Bottom) */}
        <line
          x1={startX}
          y1={centerY + diameter / 2 + 25}
          x2={startX + pixelLength}
          y2={centerY + diameter / 2 + 25}
          stroke="#444"
          strokeWidth="1.5"
        />
        {/* Ticks */}
        <line
          x1={startX}
          y1={centerY + diameter / 2 + 20}
          x2={startX}
          y2={centerY + diameter / 2 + 30}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={startX + pixelLength}
          y1={centerY + diameter / 2 + 20}
          x2={startX + pixelLength}
          y2={centerY + diameter / 2 + 30}
          stroke="#444"
          strokeWidth="1.5"
        />
        {/* Label */}
        <text
          x={startX + pixelLength / 2}
          y={centerY + diameter / 2 + 40}
          fontSize="12"
          fontWeight="bold"
          fill="#222"
          textAnchor="middle"
        >
          {height}"
        </text>

        {/* Diameter Line (Right Side) */}
        <line
          x1={startX + pixelLength + 20}
          y1={centerY - diameter / 2}
          x2={startX + pixelLength + 20}
          y2={centerY + diameter / 2}
          stroke="#444"
          strokeWidth="1.5"
        />
        {/* Ticks */}
        <line
          x1={startX + pixelLength + 15}
          y1={centerY - diameter / 2}
          x2={startX + pixelLength + 25}
          y2={centerY - diameter / 2}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={startX + pixelLength + 15}
          y1={centerY + diameter / 2}
          x2={startX + pixelLength + 25}
          y2={centerY + diameter / 2}
          stroke="#444"
          strokeWidth="1.5"
        />
        {/* Label */}
        <text
          x={startX + pixelLength + 35}
          y={centerY + 4}
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {width}"
        </text>
      </svg>
    );
  }

  // -- BOX RENDERER (REWRITTEN FOR PERFECT GEOMETRY) --

  const scale = 3.2;
  const cos30 = 0.866;
  const sin30 = 0.5;
  const w_scaled = width * scale;
  const l_scaled = height * scale;
  const h_scaled = depth * scale * 1.5;

  const vbW = 340;
  const vbH = 300;
  const startX = vbW / 2;
  const startY = 35;

  const vecW = { x: w_scaled * cos30, y: w_scaled * sin30 };
  const vecL = { x: -l_scaled * cos30, y: l_scaled * sin30 };
  const vecH = { x: 0, y: h_scaled };

  const top_center = { x: startX, y: startY };
  const top_right = { x: top_center.x + vecW.x, y: top_center.y + vecW.y };
  const top_left = { x: top_center.x + vecL.x, y: top_center.y + vecL.y };
  const top_bottom = {
    x: top_center.x + vecW.x + vecL.x,
    y: top_center.y + vecW.y + vecL.y,
  };
  const bot_center = { x: top_center.x + vecH.x, y: top_center.y + vecH.y };
  const bot_right = { x: top_right.x + vecH.x, y: top_right.y + vecH.y };
  const bot_left = { x: top_left.x + vecH.x, y: top_left.y + vecH.y };
  const bot_bottom = { x: top_bottom.x + vecH.x, y: top_bottom.y + vecH.y };

  // --- NEW: Calculate Midpoints for the Tape Seam ---
  // The seam runs between the midpoint of the top-left edge and the bottom-right edge of the top face.
  const mid_TL_edge = {
    x: (top_center.x + top_left.x) / 2,
    y: (top_center.y + top_left.y) / 2,
  };
  const mid_BR_edge = {
    x: (top_right.x + top_bottom.x) / 2,
    y: (top_right.y + top_bottom.y) / 2,
  };

  const pad = 25;
  const tickSz = 4;
  const dimL_start = {
    x: bot_left.x - pad * cos30,
    y: bot_left.y + pad * sin30,
  };
  const dimL_end = {
    x: bot_bottom.x - pad * cos30,
    y: bot_bottom.y + pad * sin30,
  };
  const tickL = { x: -tickSz * sin30, y: tickSz * cos30 };
  const dimW_start = {
    x: bot_bottom.x + pad * cos30,
    y: bot_bottom.y + pad * sin30,
  };
  const dimW_end = {
    x: bot_right.x + pad * cos30,
    y: bot_right.y + pad * sin30,
  };
  const tickW = { x: tickSz * sin30, y: tickSz * cos30 };
  const dimH_start = { x: top_right.x + 20, y: top_right.y };
  const dimH_end = { x: bot_right.x + 20, y: bot_right.y };

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full drop-shadow-2xl"
    >
      <defs>
        <linearGradient id="boxTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e3ce" />
          <stop offset="100%" stopColor="#e8d0b3" />
        </linearGradient>
        <linearGradient id="boxLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dcb386" />
          <stop offset="100%" stopColor="#c49a6c" />
        </linearGradient>
        <linearGradient id="boxRight" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c49a6c" />
          <stop offset="100%" stopColor="#a37e58" />
        </linearGradient>
      </defs>

      <g>
        <path
          d={`M${bot_left.x} ${bot_left.y} L${bot_bottom.x} ${bot_bottom.y} L${bot_right.x} ${bot_right.y} L${bot_center.x} ${bot_center.y} Z`}
          fill="#000"
          opacity="0.2"
          transform="translate(0, 15)"
          filter="blur(5px)"
        />

        {/* Faces */}
        <path
          d={`M${top_left.x},${top_left.y} L${top_bottom.x},${top_bottom.y} L${bot_bottom.x},${bot_bottom.y} L${bot_left.x},${bot_left.y} Z`}
          fill="url(#boxLeft)"
          stroke="#bfa07d"
          strokeWidth="0.5"
        />
        <path
          d={`M${top_bottom.x},${top_bottom.y} L${top_right.x},${top_right.y} L${bot_right.x},${bot_right.y} L${bot_bottom.x},${bot_bottom.y} Z`}
          fill="url(#boxRight)"
          stroke="#bfa07d"
          strokeWidth="0.5"
        />
        <path
          d={`M${top_center.x},${top_center.y} L${top_right.x},${top_right.y} L${top_bottom.x},${top_bottom.y} L${top_left.x},${top_left.y} Z`}
          fill="url(#boxTop)"
          stroke="#bfa07d"
          strokeWidth="0.5"
        />

        {/* --- NEW: TAPE SEAM --- */}
        {/* The seam line (dark, thin) */}
        <line
          x1={mid_TL_edge.x}
          y1={mid_TL_edge.y}
          x2={mid_BR_edge.x}
          y2={mid_BR_edge.y}
          stroke="#a37e58"
          strokeWidth="0.5"
        />
        {/* The tape (lighter, wider, translucent) */}
        <line
          x1={mid_TL_edge.x}
          y1={mid_TL_edge.y}
          x2={mid_BR_edge.x}
          y2={mid_BR_edge.y}
          stroke="#f8eadd"
          strokeWidth="12"
          opacity="0.6"
          strokeLinecap="butt"
        />

        {/* Dimensions */}
        <line
          x1={bot_left.x}
          y1={bot_left.y}
          x2={dimL_start.x}
          y2={dimL_start.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={bot_bottom.x}
          y1={bot_bottom.y}
          x2={dimL_end.x}
          y2={dimL_end.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={dimL_start.x}
          y1={dimL_start.y}
          x2={dimL_end.x}
          y2={dimL_end.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimL_start.x - tickL.x}
          y1={dimL_start.y - tickL.y}
          x2={dimL_start.x + tickL.x}
          y2={dimL_start.y + tickL.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimL_end.x - tickL.x}
          y1={dimL_end.y - tickL.y}
          x2={dimL_end.x + tickL.x}
          y2={dimL_end.y + tickL.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <text
          x={(dimL_start.x + dimL_end.x) / 2 - 15}
          y={(dimL_start.y + dimL_end.y) / 2 + 20}
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {height}"
        </text>

        <line
          x1={bot_bottom.x}
          y1={bot_bottom.y}
          x2={dimW_start.x}
          y2={dimW_start.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={bot_right.x}
          y1={bot_right.y}
          x2={dimW_end.x}
          y2={dimW_end.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={dimW_start.x}
          y1={dimW_start.y}
          x2={dimW_end.x}
          y2={dimW_end.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimW_start.x - tickW.x}
          y1={dimW_start.y - tickW.y}
          x2={dimW_start.x + tickW.x}
          y2={dimW_start.y + tickW.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimW_end.x - tickW.x}
          y1={dimW_end.y - tickW.y}
          x2={dimW_end.x + tickW.x}
          y2={dimW_end.y + tickW.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <text
          x={(dimW_start.x + dimW_end.x) / 2 + 5}
          y={(dimW_start.y + dimW_end.y) / 2 + 20}
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {width}"
        </text>

        <line
          x1={top_right.x}
          y1={top_right.y}
          x2={dimH_start.x}
          y2={dimH_start.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={bot_right.x}
          y1={bot_right.y}
          x2={dimH_end.x}
          y2={dimH_end.y}
          stroke="#aaa"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={dimH_start.x}
          y1={dimH_start.y}
          x2={dimH_end.x}
          y2={dimH_end.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimH_start.x - 4}
          y1={dimH_start.y}
          x2={dimH_start.x + 4}
          y2={dimH_start.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <line
          x1={dimH_end.x - 4}
          y1={dimH_end.y}
          x2={dimH_end.x + 4}
          y2={dimH_end.y}
          stroke="#444"
          strokeWidth="1.5"
        />
        <text
          x={dimH_start.x + 8}
          y={(dimH_start.y + dimH_end.y) / 2 + 4}
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {depth}"
        </text>
      </g>
    </svg>
  );
}
