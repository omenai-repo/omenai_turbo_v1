import React, { useState } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { updateEventData } from "@omenai/shared-services/gallery/events/updateEventData";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { PremiumDateInput } from "../../components/PremiumDateInput";
import { PremiumCountrySelect } from "../../components/PremiumCountrySelect";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  galleryId: string;
  onSuccess: () => void; // Triggered to refresh React Query
}

export const EditEventModal = ({
  isOpen,
  onClose,
  event,
  galleryId,
  onSuccess,
}: EditEventModalProps) => {
  const { csrf, user } = useAuth({ requiredRole: "gallery" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Expand formData to hold all possible fields
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    start_date: event.start_date
      ? new Date(event.start_date).toISOString().split("T")[0]
      : "",
    end_date: event.end_date
      ? new Date(event.end_date).toISOString().split("T")[0]
      : "",
    vip_preview_date: event.vip_preview_date
      ? new Date(event.vip_preview_date).toISOString().split("T")[0]
      : "",
    booth_number: event.booth_number || "",
    venue: event.location?.venue || "",
    city: event.location?.city || "",
    country: event.location?.country || "",
    external_url: event.external_url || "",
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast_notif("Title and dates are required.", "error");
      return;
    }

    setIsSubmitting(true);

    // 2. Build the dynamic payload based on the event type
    const payload: any = {
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      ...(formData.vip_preview_date && {
        vip_preview_date: formData.vip_preview_date,
      }),
    };

    if (event.event_type === "art_fair") {
      payload.booth_number = formData.booth_number;
      payload.location = { city: formData.city, country: formData.country };
    } else if (event.event_type === "exhibition") {
      payload.location = {
        venue: formData.venue,
        city: formData.city,
        country: formData.country,
      };
    } else if (event.event_type === "viewing_room") {
      payload.external_url = formData.external_url;
    }

    // 3. Send the sculpted payload to the backend
    const response = await updateEventData(
      user?.gallery_id || galleryId,
      event.event_id,
      payload,
      csrf || "",
    );

    if (response.isOk) {
      toast_notif("Details updated.", "success");
      onSuccess(); // Refresh the dashboard data
      onClose();
    } else {
      toast_notif(response.message, "error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-light text-dark">Edit Presentation</h2>
            <p className="text-xs text-neutral-500 tracking-wide mt-1">
              Update the public details for this{" "}
              {event.event_type.replace("_", " ")}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-dark transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form - Added overflow-y-auto to allow scrolling if fields stack too high */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto custom-scrollbar"
        >
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              Presentation Title
            </label>
            <input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-lg font-light text-dark focus:border-dark focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                Opening Date
              </label>
              <PremiumDateInput
                value={formData.start_date}
                onChange={(val: string) => handleChange("start_date", val)}
                placeholder="SELECT DATE"
                disablePastDates={true}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                Closing Date
              </label>
              <PremiumDateInput
                value={formData.end_date}
                onChange={(val: string) => handleChange("end_date", val)}
                disablePastDates={true}
                placeholder="SELECT DATE"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                VIP Preview
              </label>
              <PremiumDateInput
                value={formData.vip_preview_date}
                onChange={(val: string) =>
                  handleChange("vip_preview_date", val)
                }
                disablePastDates={true}
                placeholder="SELECT DATE"
              />
            </div>
          </div>

          {/* DYNAMIC FIELDS: Art Fair */}
          {event.event_type === "art_fair" && (
            <div className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    Booth Number
                  </label>
                  <input
                    type="text"
                    value={formData.booth_number}
                    onChange={(e) =>
                      handleChange("booth_number", e.target.value)
                    }
                    className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm font-light text-dark focus:border-dark outline-none transition-colors"
                    placeholder="e.g. C14"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm font-light text-dark focus:border-dark outline-none transition-colors"
                    placeholder="e.g. Miami"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    Country
                  </label>
                  <PremiumCountrySelect
                    value={formData.country}
                    onChange={(val: string) => handleChange("country", val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS: Exhibition */}
          {event.event_type === "exhibition" && (
            <div className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    Venue / Gallery Name
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm font-light text-dark focus:border-dark outline-none transition-colors"
                    placeholder="e.g. Main Space"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm font-light text-dark focus:border-dark outline-none transition-colors"
                    placeholder="e.g. London"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                    Country
                  </label>
                  <PremiumCountrySelect
                    value={formData.country}
                    onChange={(val: string) => handleChange("country", val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS: Viewing Room */}
          {event.event_type === "viewing_room" && (
            <div className="pt-4">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                External Link (Optional)
              </label>
              <input
                type="url"
                value={formData.external_url}
                onChange={(e) => handleChange("external_url", e.target.value)}
                className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm font-light text-dark focus:border-dark outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              Curatorial Statement
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full bg-transparent border border-neutral-200 p-4 text-sm text-neutral-900 focus:border-dark focus:ring-0 outline-none transition-colors rounded-sm resize-none custom-scrollbar"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-neutral-100 flex justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase text-neutral-500 hover:text-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase bg-dark text-white hover:bg-neutral-800 transition-colors rounded-sm shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
