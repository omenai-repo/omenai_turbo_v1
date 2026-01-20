import React, { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { formatSurveyAnswer } from "../../../utils/surveyConstants";
import { generateSurveyStrategy } from "../../../utils/surveyStrategy";
import { ChallengeBar } from "./charts/ChallengeBar";
import { SurveyRadar } from "./charts/SurveyRadar";
import { fetchSurveyView } from "@omenai/shared-services/analytics/fetchSurveyView";
export const SurveyView = () => {
  const [countryFilter, setCountryFilter] = useState("");
  const [page, setPage] = useState(1); // 👈 Pagination State

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["survey-stats", countryFilter, page],
    queryFn: async () => await fetchSurveyView(countryFilter, page),
    placeholderData: keepPreviousData,
  });

  const stats = data?.stats;
  const pagination = data?.pagination;
  const strategies = stats ? generateSurveyStrategy(stats) : [];

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-400">
        Analyzing Market Psyche...
      </div>
    );
  if (!stats)
    return (
      <div className="p-10 text-center text-red-400">No Survey Data Found</div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 1. FILTER BAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          📊 Market Consensus
          {isFetching && (
            <span className="text-xs font-normal text-blue-500 animate-pulse ml-2">
              Updating data...
            </span>
          )}
        </h2>

        {/* DYNAMIC COUNTRY SELECT */}
        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[200px]"
        >
          <option value="">Global (All Regions)</option>

          {/* 👇 The Dynamic Render Loop */}
          {stats?.distinct_countries?.map((c: any) => (
            <option key={c._id} value={c._id}>
              {c._id || "Unknown Region"} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* 2. STRATEGY ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map((strat: any, i: number) => (
          <div
            key={i}
            className={`p-6 rounded-xl border-l-4 shadow-sm ${
              strat.type === "warning"
                ? "bg-red-50 border-red-500"
                : strat.type === "opportunity"
                  ? "bg-blue-50 border-blue-500"
                  : "bg-green-50 border-green-500"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                {strat.type}
              </span>
              <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                {strat.metric}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{strat.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {strat.message}
            </p>
          </div>
        ))}
      </div>

      {/* 3. VISUALIZATIONS */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
          <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">
            What Users Value Most
          </h3>
          <SurveyRadar data={stats.value_drivers_global} />
        </div>
        <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
          <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">
            Top Challenges (Pain Points)
          </h3>
          <ChallengeBar data={stats.challenges_global} />
        </div>
      </div>

      {/* 4. DEEP DIVE: RAW RESPONSES (Now Paginated & Readable) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">
            Individual Responses{" "}
            <span className="text-slate-400 font-normal ml-2">
              ({pagination?.total} Total)
            </span>
          </h3>
          {isFetching && (
            <span className="text-xs text-blue-500 animate-pulse">
              Refreshing data...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Entity</th>
                <th className="px-6 py-3">Key Challenge</th>
                <th className="px-6 py-3">Value Driver</th>
                <th className="px-6 py-3">Discovery Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.raw_responses.map((user: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name} <br />
                    <span className="text-xs text-slate-400 font-normal">
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${user.entity === "artist" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {user.entity}
                    </span>
                  </td>
                  {/* 👇 Using the new formatter here */}
                  <td
                    className="px-6 py-4 max-w-[200px] truncate"
                    title={formatSurveyAnswer(user.survey?.current_challenges)}
                  >
                    {formatSurveyAnswer(user.survey?.current_challenges)}
                  </td>
                  <td
                    className="px-6 py-4 max-w-[200px] truncate"
                    title={formatSurveyAnswer(user.survey?.app_value_drivers)}
                  >
                    {formatSurveyAnswer(user.survey?.app_value_drivers)}
                  </td>
                  <td
                    className="px-6 py-4 max-w-[200px] truncate"
                    title={formatSurveyAnswer(
                      user.survey?.art_discovery_or_share_method,
                    )}
                  >
                    {formatSurveyAnswer(
                      user.survey?.art_discovery_or_share_method,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION CONTROLS */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-mono">
            Page {pagination?.current} of {pagination?.pages}
          </span>
          <button
            disabled={page >= (pagination?.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
