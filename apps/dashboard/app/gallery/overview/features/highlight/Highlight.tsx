import HighlightCard from "./components/HighlightCard";
import { highlightCardEl } from "./mocks";

export default function Highlights() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {highlightCardEl.map((item, index) => {
        return (
          <HighlightCard
            key={item.tag}
            title={item.title}
            icon={item.icon}
            tag={item.tag}
          />
        );
      })}
    </div>
  );
}
