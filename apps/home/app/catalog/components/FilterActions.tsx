import { MdOutlineClear } from "react-icons/md";

export default function FilterActions() {
  return (
    <div className="w-full">
      <button className="flex items-center gap-x-4 bg-[#FAFAFA] border border-dark/10 h-[40px] px-4">
        <span>Apply Filters</span>
        <MdOutlineClear />
      </button>
    </div>
  );
}
