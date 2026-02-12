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
  bankCode?: string;
  disabled: boolean;
}

export function SearchableSelect({
  type,
  onChange,
  selectedItem,
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
          const response = await getAsyncData(
            type,
            user.address.countryCode,
            bankCode,
          );
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
    <Combobox.Option value={getName(item)} key={getCode(item)}>
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
      dropdownPadding={8}
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
            loading ? <Loader size={16} /> : <ChevronDown size={16} />
          }
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          size="sm"
          classNames={{
            input: "text-left font-light",
            label: "mb-1 font-light text-slate-700",
          }}
        >
          {selectedItem ? (
            getName(selectedItem)
          ) : (
            <Input.Placeholder>{config.placeholder}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown className="max-h-[300px] overflow-y-auto shadow-lg border-slate-100 rounded-lg">
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder={config.searchPlaceholder}
          leftSection={<Search size={14} />}
        />
        <Combobox.Options className="pt-2">
          {loading ? (
            <Combobox.Empty>
              <div className="flex justify-center py-4">
                <LoadSmall />
              </div>
            </Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty className="text-base text-slate-500 py-4 text-center">
              {config.empty}
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
