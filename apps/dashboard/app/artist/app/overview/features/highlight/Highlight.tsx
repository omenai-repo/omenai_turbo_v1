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
            className="flex flex-col rounded-[20px] shadow p-4 bg-dark text-white"
          >
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-[#909090] text-fluid-xxs font-normal">
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
