import React from "react";
import ImageBlock from "../register/gallery/features/image/Image";

export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
      <ImageBlock />
      {children}
    </section>
  );
}
