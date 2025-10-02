"use client";
import { useState, useCallback, useMemo } from "react";
import { Combobox, Input, InputBase, Loader, useCombobox } from "@mantine/core";
import { getBanks } from "@omenai/shared-services/wallet/getBanks";
import { getBankBranches } from "@omenai/shared-services/wallet/getBankBranches";
import {
  ArtistSchemaTypes,
  BankBranchType,
  BankType,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

async function getAsyncData(
  type: "banks" | "branches",
  countryCode: string,
  bankCode?: string
) {
  let response;

  if (type === "banks") {
    const get_banks_response = await getBanks(countryCode);
    if (get_banks_response === undefined || !get_banks_response.isOk) {
      throw new Error(
        "Unable to retrieve banks list. Please try again or contact support"
      );
    }
    response = get_banks_response?.data;
  }

  if (type === "branches" && bankCode) {
    const get_banks_branches_response = await getBankBranches(bankCode);
    if (
      get_banks_branches_response === undefined ||
      !get_banks_branches_response.isOk
    ) {
      throw new Error(
        "Unable to retrieve banks list. Please try again or contact support"
      );
    }

    response = get_banks_branches_response?.data;
  }

  return response;
}

export function SearchableSelect({
  type,
  setSelect,
  bankCode,
  disabled,
}: {
  type: "banks" | "branches";
  setSelect: (
    type: "banks" | "branches",
    value: BankType | BankBranchType
  ) => void;
  bankCode?: string;
  disabled: boolean;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BankType[] | BankBranchType[]>([]);
  const { user } = useAuth({ requiredRole: "artist" });
  const [search, setSearch] = useState("");

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
            bankCode || ""
          );
          setData(response);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
        combobox.focusSearchInput();
        combobox.resetSelectedOption();
      }
    },
  });

  // Memoize the name getter to avoid repetitive conditionals
  const getName = useCallback(
    (item: BankType | BankBranchType) =>
      "name" in item ? item.name : item.branch_name,
    []
  );

  const getCode = useCallback(
    (item: BankType | BankBranchType) =>
      "code" in item ? item.code : item.branch_code,
    []
  );

  // Memoize the handleOptionSubmit to prevent recreation on every render
  const handleOptionSubmit = useCallback(
    (val: string) => {
      const selected_data = data.find(
        (item: BankType | BankBranchType) => getName(item) === val
      );
      setValue(val);
      setSelect(type, selected_data as BankType | BankBranchType);
      combobox.closeDropdown();
    },
    [data, getName, setSelect, type, combobox]
  );

  // Memoize filtered and mapped options for better performance
  const options = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    return data
      .filter((item: BankType | BankBranchType) =>
        getName(item).toLowerCase().includes(searchLower)
      )
      .map((item: BankType | BankBranchType) => (
        <Combobox.Option value={getName(item)} key={getCode(item)}>
          {getName(item)}
        </Combobox.Option>
      ));
  }, [data, search, getName, getCode]);

  // Memoize placeholder and label text
  const placeholderText = useMemo(
    () => (type === "banks" ? "Select bank" : "Select bank branch"),
    [type]
  );

  const labelText = useMemo(
    () => (type === "banks" ? "Select your bank" : "Select your bank branch"),
    [type]
  );

  const searchPlaceholder = useMemo(
    () => (type === "banks" ? "Search your bank" : "Search your bank branch"),
    [type]
  );

  // Memoize empty state message
  const emptyMessage = useMemo(() => {
    if (type === "branches") {
      return "No branches listed for this bank. Kindly continue.";
    }
    return "No banks match your search criteria. Please try again.";
  }, [type]);

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={handleOptionSubmit}
      disabled={disabled}
      dropdownPadding={6}
      offset={0}
    >
      <Combobox.Target>
        <InputBase
          label={labelText}
          component="button"
          type="button"
          pointer
          rightSection={loading ? <Loader size={18} /> : <Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {value || <Input.Placeholder>{placeholderText}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown className="max-h-[500px] overflow-scroll">
        <Combobox.Search
          className="placeholder:text-dark"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder={searchPlaceholder}
        />
        <Combobox.Options>
          {loading ? (
            <Combobox.Empty>
              <div className="flex justify-center items-center w-full">
                <LoadSmall />
              </div>
            </Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>
              <span className="text-fluid-xs font-light">{emptyMessage}</span>
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
