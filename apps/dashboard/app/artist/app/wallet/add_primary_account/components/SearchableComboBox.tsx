"use client";

import { useState, useCallback, useMemo } from "react";
import { Combobox, InputBase, Loader, useCombobox, Input } from "@mantine/core";
import { getBanks } from "@omenai/shared-services/wallet/getBanks";
import { getBankBranches } from "@omenai/shared-services/wallet/getBankBranches";
import { BankBranchType, BankType } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
import { ChevronDown, Search } from "lucide-react";

// --- Helper Types & Guards ---
const isBank = (item: BankType | BankBranchType): item is BankType =>
  "code" in item;

// --- Async Data Fetcher ---
async function getAsyncData(
  type: "banks" | "branches",
  countryCode: string,
  bankCode?: string,
) {
  if (type === "banks") {
    const response = await getBanks(countryCode);
    if (!response?.isOk) throw new Error("Unable to retrieve banks list.");
    return response.data;
  }

  if (type === "branches" && bankCode) {
    const response = await getBankBranches(bankCode);
    if (!response?.isOk) throw new Error("Unable to retrieve branches list.");
    return response.data;
  }

  return [];
}

interface SearchableSelectProps {
  type: "banks" | "branches";
  onChange: (value: BankType | BankBranchType | null) => void;
  selectedItem: BankType | BankBranchType | null; // Controlled prop
  countryCode: string;
  bankCode?: string;
  disabled: boolean;
}

export function SearchableSelect({
  type,
  onChange,
  selectedItem,
  countryCode,
  bankCode,
  disabled,
}: SearchableSelectProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BankType[] | BankBranchType[]>([]);
  const [search, setSearch] = useState("");

  const { user } = useAuth({ requiredRole: "artist" });
  const rollbar = useRollbar();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch("");
    },
    onDropdownOpen: async () => {
      if (data.length === 0 && !loading) {
        setLoading(true);
        try {
          const response = await getAsyncData(type, countryCode, bankCode);
          setData(response);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          rollbar.error(err);
          console.error("Error loading data:", err);
        } finally {
          setLoading(false);
        }
      }
    },
  });

  // --- Helpers for Display Names ---
  const getName = useCallback(
    (item: BankType | BankBranchType) =>
      isBank(item) ? item.name : item.branch_name,
    [],
  );

  const getCode = useCallback(
    (item: BankType | BankBranchType) =>
      isBank(item) ? String(item.id) : String(item.id),
    [],
  );

  // --- Filter Options ---
  const filteredOptions = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return data.filter((item) =>
      getName(item).toLowerCase().includes(searchLower),
    );
  }, [data, search, getName]);

  const options = filteredOptions.map((item) => (
    <Combobox.Option
      value={getName(item)}
      key={getCode(item)}
      className="flex items-center px-4 py-3 mx-1 my-0.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 data-[combobox-selected]:bg-indigo-50 data-[combobox-selected]:text-indigo-700 data-[combobox-selected]:hover:bg-indigo-100 transition-colors cursor-pointer"
    >
      {getName(item)}
    </Combobox.Option>
  ));

  // --- Handler ---
  const handleOptionSubmit = (val: string) => {
    const selected = data.find((item) => getName(item) === val);
    if (selected) {
      onChange(selected);
    }
    combobox.closeDropdown();
  };

  // --- Labels & Text ---
  const config = useMemo(
    () => ({
      label: type === "banks" ? "Select Bank" : "Select Branch",
      placeholder: type === "banks" ? "Choose your bank" : "Choose your branch",
      searchPlaceholder:
        type === "banks" ? "Search banks..." : "Search branches...",
      empty: type === "branches" ? "No branches found." : "No banks found.",
    }),
    [type],
  );

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={handleOptionSubmit}
      disabled={disabled}
      dropdownPadding={0} // Removed Mantine's default padding to handle via Tailwind
    >
      <Combobox.Target>
        <InputBase
          label={config.label}
          description={
            type === "branches" ? "Required for some banks" : undefined
          }
          component="button"
          type="button"
          pointer
          rightSection={
            loading ? (
              <Loader size={16} className="text-indigo-500" />
            ) : (
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${combobox.dropdownOpened ? "rotate-180" : ""}`}
              />
            )
          }
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          size="md"
          classNames={{
            root: "flex flex-col gap-1.5",
            label: "text-sm font-semibold text-slate-800 tracking-tight",
            description: "text-xs text-slate-500 mt-1",
            input:
              "w-full bg-white border border-slate-200 rounded-xl px-4 text-left text-sm text-slate-900 shadow-[0_2px_4px_rgb(0,0,0,0.02)] transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed",
          }}
        >
          {selectedItem ? (
            <span className="font-medium text-slate-900">
              {getName(selectedItem)}
            </span>
          ) : (
            <Input.Placeholder className="text-slate-400 font-normal">
              {config.placeholder}
            </Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown className="max-h-[350px] flex flex-col overflow-hidden bg-white shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-slate-100 rounded-2xl mt-2 z-50">
        {/* Sticky Search Header */}
        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
          <Combobox.Search
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={config.searchPlaceholder}
            leftSection={<Search size={16} className="text-slate-400 ml-1" />}
            classNames={{
              input:
                "w-full bg-slate-50 border-transparent rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal",
            }}
          />
        </div>

        {/* Scrollable Options Area */}
        <Combobox.Options className="overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {loading ? (
            <Combobox.Empty>
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <LoadSmall />
                <span className="text-xs font-medium text-slate-500 animate-pulse">
                  Fetching {type}...
                </span>
              </div>
            </Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="p-3 bg-slate-50 rounded-full">
                <Search size={20} className="text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-500">
                {config.empty}
              </span>
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
