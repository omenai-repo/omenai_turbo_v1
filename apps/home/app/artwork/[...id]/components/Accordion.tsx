import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type AccordionPropTypes = {
  header: string;
  items: { icon?: React.ReactNode; content: string }[];
};
export default function Accordion({ header, items }: AccordionPropTypes) {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative">
      <div className="text-dark/80">
        <hr className="border-1 border-[#e0e0e0]" />
        <div className="py-4 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex justify-between items-center cursor-pointer">
            <p className="text-[14px] font-medium ">{header}</p>
            <MdOutlineKeyboardArrowDown
              className={`${open ? "rotate-180" : "rotate-[-180]"} duration-300`}
            />
          </div>

          {/* Accordion content */}
          <div className={`my-4 ${open ? "block" : "hidden"}`}>
            <ul className="flex flex-col space-y-4">
              {items.map((item, index) => {
                return (
                  <li
                    className="flex items-center gap-x-2 text-base"
                    key={index + item.content}
                  >
                    {item.icon && item.icon}
                    {item.content}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <hr className="border-1 border-[#e0e0e0]" />
      </div>
    </div>
  );
}
