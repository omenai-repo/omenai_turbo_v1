// components/LenisProvider.tsx
"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import React from "react";

// 💡 PropsWithChildren is the standard way to type children in TS/React
type LenisProviderProps = {
  children: React.ReactNode;
};

// This component provides the Lenis context and smooth scroll behavior.
const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.9,
        duration: 1.3, // Spring duration - Lower is slower
        wheelMultiplier: 0.35, // Better fine-grained control for viewing art - Lower values are slower
      }}
    >
      {children}
    </ReactLenis>
  );
};

export default LenisProvider;
