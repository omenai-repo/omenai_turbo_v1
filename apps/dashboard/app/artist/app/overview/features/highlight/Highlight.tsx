import HighlightCard from "./components/HighlightCard";
import { highlightCardEl } from "./mocks";
import HighlightCardIcon from "./components/HighlightCardIcon";

export default function Highlight() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {highlightCardEl.map((item, index) => {
        return (
          <div
            key={`dark-${item.title}`}
            className="relative bg-slate-900 rounded shadow-lg overflow-hidden group"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, ${item.color} 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-fluid-xxs font-medium text-slate-400 uppercase tracking-wide">
                    {item.title}
                  </p>
                  <div className="text-white">
                    <HighlightCard
                      title={item.title}
                      icon={item.icon}
                      tag={item.tag}
                    />
                  </div>
                  {/* {item.tag && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {item.tag.toUpperCase()}
                    </span>
                  )} */}
                </div>

                <div className="flex-shrink-0">
                  <div className="relative">
                    <div
                      className="absolute inset-0 blur-xl opacity-40"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="relative">
                      <HighlightCardIcon icon={item.icon} color={item.color} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
