"use client";

import { ArtistCategorizationAnswerTypes } from "@omenai/shared-types";
import {
  GraduationCap,
  Palette,
  User,
  Users,
  Building2,
  Sparkles,
  Globe,
  Library,
} from "lucide-react";

// Simplified the theme to rely on explicit Tailwind classes for the icons and badges
const categoryItems = [
  {
    key: "graduate",
    title: "Educational Background",
    question: "Are you a graduate?",
    icon: GraduationCap,
    theme: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
  },
  {
    key: "mfa",
    title: "Advanced Degree",
    question: "Do you have an MFA?",
    icon: Palette,
    theme: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200",
    },
  },
  {
    key: "solo",
    title: "Solo Exhibitions",
    question: "How many solo exhibitions?",
    icon: User,
    theme: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
  },
  {
    key: "group",
    title: "Group Exhibitions",
    question: "How many group exhibitions?",
    icon: Users,
    theme: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
    },
  },
  {
    key: "museum_collection",
    title: "Museum Collections",
    question: "In museum collections?",
    icon: Library,
    theme: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
    },
  },
  {
    key: "museum_exhibition",
    title: "Museum Exhibitions",
    question: "Featured in museums?",
    icon: Building2,
    theme: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
    },
  },
  {
    key: "art_fair",
    title: "Art Fair Participation",
    question: "Featured in art fairs?",
    icon: Sparkles,
    theme: {
      bg: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-200",
    },
  },
  {
    key: "biennale",
    title: "International Recognition",
    question: "Biennale participation?",
    icon: Globe,
    theme: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
    },
  },
];

export default function CategorizationAnswers({
  answers,
}: {
  answers: ArtistCategorizationAnswerTypes;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-md font-medium tracking-tight text-dark">
        Background Questionnaire
      </h2>

      {/* --- Quick Glance Summary (Moved to Top) --- */}
      <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
        {[
          {
            label: "Education",
            value: answers.graduate === "yes" ? "Graduate" : "Non-Graduate",
          },
          {
            label: "MFA Degree",
            value: answers.mfa === "yes" ? "Yes" : "No",
          },
          {
            label: "Total Exhibitions",
            value: `${Number(answers.solo || 0) + Number(answers.group || 0)} Shows`,
          },
          {
            label: "Museum Feature",
            value:
              answers.museum_collection === "yes" ||
              answers.museum_exhibition === "yes"
                ? "Yes"
                : "No",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="flex flex-col border-l border-slate-200 pl-4 first:border-0 first:pl-0 sm:border-l sm:pl-4 sm:first:border-0 sm:first:pl-0"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </span>
            <span className="mt-1 text-sm font-medium text-dark">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* --- Detailed Q&A Grid --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categoryItems.map((item) => {
          const IconComponent = item.icon;
          const answer =
            answers[item.key as keyof ArtistCategorizationAnswerTypes];

          // Format numeric answers to look better (e.g. "5" -> "5 Exhibitions")
          const isNumeric =
            typeof answer === "number" ||
            (typeof answer === "string" && !isNaN(Number(answer)));
          const displayAnswer = isNumeric
            ? answer
            : String(answer).charAt(0).toUpperCase() + String(answer).slice(1);

          return (
            <div
              key={item.key}
              className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
            >
              {/* Sleek Icon Container */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.theme.bg} ${item.theme.text}`}
              >
                <IconComponent size={20} strokeWidth={2} />
              </div>

              {/* Text Content */}
              <div className="flex flex-1 flex-col">
                <h3 className="text-sm font-normal text-dark">{item.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{item.question}</p>

                {/* Answer Badge */}
                <div className="mt-3 flex items-center">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide ${item.theme.bg} ${item.theme.text} ${item.theme.border}`}
                  >
                    {displayAnswer}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
