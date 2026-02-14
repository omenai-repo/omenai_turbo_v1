import { useState } from "react";
import { MdAdd, MdRemove } from "react-icons/md";

type AccordionPropTypes = {
  header: string;
  items: { content: string }[]; // Removed Icon prop for cleanliness
};

export default function Accordion({ header, items }: AccordionPropTypes) {
  const [open, setOpen] = useState(false); // Default closed for cleaner look

  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left group"
      >
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-neutral-600 group-hover:text-dark transition-colors">
          {header}
        </span>
        {open ? (
          <MdRemove className="text-neutral-400" />
        ) : (
          <MdAdd className="text-neutral-400" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 opacity-100 pb-4" : "max-h-0 opacity-0"}`}
      >
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="font-sans text-xs text-neutral-500 pl-4 border-l border-neutral-200"
            >
              {item.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
