"use client";

import React, { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { fetchCurationData } from "@omenai/shared-services/admin/fetchCurationData";
import MobileFallback from "./MobileFallback";
import LibraryPanel from "./LibraryPanel";
import BoardPanel from "./BoardPanel";
import { CurationItem, MAX_ITEMS } from "../curationTypes";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { saveCurationDraft } from "@omenai/shared-services/curation/saveDraft";
import { publishCuration } from "@omenai/shared-services/curation/publishDraft";
import { fetchCurationDraft } from "@omenai/shared-services/curation/fetchDraft";
import { resolveIdentifier } from "../utils";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

export default function CurationWorkspace({
  curationType,
}: {
  curationType: "curator_picks" | "featured_feed";
}) {
  const { csrf } = useAuth({ requiredRole: "admin" });

  // Core Data States
  const [draftItems, setDraftItems] = useState<CurationItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("artwork");

  // Loading & Saving States
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  // --- NEW: Pagination & Search States ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 1. Fetch Draft on mount
  useEffect(() => {
    const fetchDraft = async () => {
      const res = await fetchCurationDraft(curationType);
      console.log("API Response:", res);
      if (res.isOk && res.data) setDraftItems(res.data);
    };
    fetchDraft();
  }, [curationType]);

  // 2. Handle Search Debouncing (waits 400ms after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 3. Reset page and clear items if active tab or search query changes
  useEffect(() => {
    setPage(1);
    setLibraryItems([]);
  }, [activeTab, debouncedSearch]);

  // 4. Fetch Library Data (Triggered by tab, page, or debounced search changes)
  useEffect(() => {
    const fetchLibraryData = async () => {
      setIsLoadingLibrary(true);
      try {
        const res = await fetchCurationData(activeTab, page, debouncedSearch);
        if (!res.isOk) throw new Error("Failed");

        // Extract data and pagination from the updated backend response
        setLibraryItems(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingLibrary(false);
      }
    };
    fetchLibraryData();
  }, [activeTab, page, debouncedSearch]);

  // Tab Change Handler (Clears search state completely when switching tabs)
  const handleTabChange = (newTab: string) => {
    setLibraryItems([]);
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveTab(newTab);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraftItems((items) => {
        const oldIndex = items.findIndex((i) => i.identifier === active.id);
        const newIndex = items.findIndex((i) => i.identifier === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddItem = (item: any) => {
    if (draftItems.length >= MAX_ITEMS) return;

    // Strict ID resolution to prevent React Key crashes
    const identifier = resolveIdentifier(item, activeTab);

    setDraftItems((prev) => [
      ...prev,
      { type: activeTab, identifier, data: item },
    ]);
  };

  const handleRemoveItem = (identifierToRemove: string) => {
    setDraftItems((prev) =>
      prev.filter((item) => item.identifier !== identifierToRemove),
    );
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveCurationDraft(curationType, draftItems, csrf || "");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const response = await publishCuration(curationType, csrf || "");
    if (!response.isOk)
      toast_notif(
        response.message || "Something went wrong, please contact support",
        "error",
      );
    else {
      toast_notif(response.message, "success");
      setIsPublishing(false);
    }
  };

  return (
    <>
      <MobileFallback />

      <div className="hidden md:flex h-[calc(100vh-68px)] overflow-hidden bg-[#FAF8F5]">
        <LibraryPanel
          curationType={curationType}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isLoadingLibrary={isLoadingLibrary}
          libraryItems={libraryItems}
          draftItems={draftItems}
          handleAddItem={handleAddItem}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />

        {/* Divider */}
        <div className="w-px bg-[#E8E4DF] shrink-0" />

        <BoardPanel
          type={activeTab}
          draftItems={draftItems}
          isSaving={isSaving}
          saveStatus={saveStatus}
          isPublishing={isPublishing}
          handleSaveDraft={handleSaveDraft}
          handlePublish={handlePublish}
          handleDragEnd={handleDragEnd}
          handleRemoveItem={handleRemoveItem}
        />
      </div>
    </>
  );
}
