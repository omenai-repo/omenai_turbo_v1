import HighlightCard from "./components/HighlightCard";
import { highlightCardEl } from "./mocks";
import HighlightCardIcon from "./components/HighlightCardIcon";

export default function Highlight() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      {highlightCardEl.map((item, index) => {
        return (
          <div
            key={item.title}
            className="flex flex-col rounded-lg shadow py-5 px-4 bg-white"
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className="text-gray-700 text-[14px] font-normal">
                  {item.title}
                </p>
                <HighlightCard
                  title={item.title}
                  icon={item.icon}
                  tag={item.tag}
                />
              </div>

              <HighlightCardIcon icon={item.icon} color={item.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
