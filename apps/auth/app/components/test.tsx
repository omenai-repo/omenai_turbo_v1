"use client";

import React, { useEffect, useRef } from "react";
import IndividualLoginForm from "../login/features/individualForm/Form";

export default function LoginScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawDots = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      const spacing = 25; // distance between dots
      ctx.fillStyle = "#d1d5db"; // subtle gray
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    drawDots();

    // Optional: subtle animation
    const animate = () => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDots();
      ctx.restore();
      requestAnimationFrame(animate);
    };

    // Comment out animate() if you want static mesh
    // animate();

    const handleResize = () => drawDots();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Centered login form */}
      <div className="relative z-10 w-full max-w-md p-8">
        <IndividualLoginForm />
      </div>
    </div>
  );
}
