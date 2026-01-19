import React from "react";
import { format } from "date-fns";

export const UserTable = ({
  users,
  selectedIds,
  toggleSelection,
  toggleAll,
}: any) => {
  const allSelected = users.length > 0 && selectedIds.length >= users.length;

  if (users.length === 0)
    return (
      <div className="p-10 text-center text-slate-400">
        No users found for this filter.
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => toggleAll(users.map((u: any) => u._id))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="p-4">User Details</th>
            <th className="p-4">KPI Profile</th>
            <th className="p-4">Acquisition</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user: any) => (
            <tr
              key={user._id}
              className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(user._id) ? "bg-blue-50" : ""}`}
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user._id)}
                  onChange={() => toggleSelection(user._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="p-4">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-sm text-slate-500">{user.email}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {user.country} • {user.device?.type || "Desktop"}
                </div>
              </td>
              <td className="p-4">
                {user.entity === "collector" ? (
                  <>
                    <span
                      className={`inline-flex px-2 py-1 capitalize rounded text-xs font-medium ${
                        user.kpi?.buying_frequency === "frequently"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.kpi?.buying_frequency
                        ? user.kpi?.buying_frequency
                        : "Unknown"}{" "}
                      purchases
                    </span>
                    <div className="text-xs capitalize text-slate-500 mt-1">
                      {user.kpi?.collector_type || "General"} collector
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {user.kpi?.formal_education || "Unknown"}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      {user.kpi?.years_of_practice || "0"} Years Exp
                    </div>
                  </>
                )}
              </td>
              <td className="p-4">
                <div className="text-sm text-slate-700 capitalize">
                  {user.marketing?.source || "Direct"}
                </div>
                <div className="text-xs text-slate-400">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </div>
              </td>
              <td className="p-4">
                {user.hasConvertedToPaid ? (
                  <span className="text-green-600 text-xs font-bold">
                    ● Paid Member
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">● Waitlist</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
