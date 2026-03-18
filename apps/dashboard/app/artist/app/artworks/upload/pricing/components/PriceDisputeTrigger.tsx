import { useState } from "react";
import PriceReviewWidget from "./PriceReviewWrapper";
import { Settings2 } from "lucide-react";

interface PriceDisputeTriggerProps {
  pricingData: any;
  artworkMeta: any;
  image: File;
}

export default function PriceDisputeTrigger({
  pricingData,
  artworkMeta,
  image,
}: PriceDisputeTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-neutral-50 border-t border-neutral-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-semibold text-dark">
            Do not agree with this listing price?
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            You can override this baseline if supported by past sales data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-dark border border-neutral-200 text-white text-fluid-xxs font-normal rounded -md hover:border-neutral-800 hover:shadow-sm transition-all"
        >
          <Settings2 size={16} className="text-white" />
          Propose price
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] h-full flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            <PriceReviewWidget
              pricingData={pricingData}
              artworkMeta={artworkMeta}
              onCancel={() => setIsModalOpen(false)}
              image={image}
            />
          </div>
        </div>
      )}
    </>
  );
}
