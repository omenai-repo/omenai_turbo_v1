// Accordion.tsx

import Accordion from "./Accordion";

export default function LegalComponents() {
  const shipping = [
    { content: "Shipping calculated at checkout." },
    { content: "Duties and taxes may apply." },
  ];
  const guarantee = [
    { content: "Encrypted payment security." },
    { content: "Verified Certificate of Authenticity." },
  ];

  return (
    <div className="flex flex-col">
      <Accordion header="Shipping & Taxes" items={shipping} />
      <Accordion header="Omenai Guarantee" items={guarantee} />
    </div>
  );
}
