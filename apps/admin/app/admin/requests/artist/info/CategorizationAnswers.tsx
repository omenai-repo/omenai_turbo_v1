"use client";
import {
  Text,
  Avatar,
  Timeline,
  Paper,
  Group,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { ArtistCategorizationAnswerTypes } from "@omenai/shared-types";
import {
  GraduationCap,
  Palette,
  User,
  Users,
  Building2,
  Sparkles,
  Globe,
} from "lucide-react";

const categoryItems = [
  {
    key: "graduate",
    title: "Educational Background",
    question: "Are you a graduate?",
    icon: GraduationCap,
    color: "blue",
    bgGradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    key: "mfa",
    title: "Advanced Degree",
    question: "Do you have an MFA?",
    icon: Palette,
    color: "violet",
    bgGradient: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    borderColor: "border-violet-200",
  },
  {
    key: "solo",
    title: "Solo Exhibitions",
    question: "How many solo exhibitions?",
    icon: User,
    color: "green",
    bgGradient: "from-green-50 to-emerald-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    key: "group",
    title: "Group Exhibitions",
    question: "How many group exhibitions?",
    icon: Users,
    color: "orange",
    bgGradient: "from-orange-50 to-amber-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    key: "museum_collection",
    title: "Museum Collections",
    question: "In museum collections?",
    icon: Building2,
    color: "red",
    bgGradient: "from-red-50 to-rose-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    key: "museum_exhibition",
    title: "Museum Exhibitions",
    question: "Featured in museums?",
    icon: Building2,
    color: "teal",
    bgGradient: "from-teal-50 to-cyan-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    borderColor: "border-teal-200",
  },
  {
    key: "art_fair",
    title: "Art Fair Participation",
    question: "Featured in art fairs?",
    icon: Sparkles,
    color: "pink",
    bgGradient: "from-pink-50 to-rose-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  {
    key: "biennale",
    title: "International Recognition",
    question: "Biennale participation?",
    icon: Globe,
    color: "indigo",
    bgGradient: "from-indigo-50 to-blue-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200",
  },
];

export default function CategorizationAnswers({
  answers,
}: {
  answers: ArtistCategorizationAnswerTypes;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryItems.map((item) => {
          const IconComponent = item.icon;
          const answer =
            answers[item.key as keyof ArtistCategorizationAnswerTypes];

          return (
            <div
              key={item.key}
              className={`relative overflow-hidden rounded-xl border ${item.borderColor} bg-gradient-to-br ${item.bgGradient} p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-5">
                <IconComponent size={120} strokeWidth={0.5} />
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-fluid-xs text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-fluid-xs text-gray-600 mb-3">
                      {item.question}
                    </p>

                    {/* Answer */}
                    <div className="inline-flex items-center gap-2">
                      <span className="text-fluid-xs font-normal text-gray-500">
                        Response:
                      </span>
                      <Badge
                        variant="filled"
                        color={item.color}
                        size="md"
                        radius="md"
                        styles={{
                          root: {
                            textTransform: "capitalize",
                            fontWeight: 600,
                            letterSpacing: "0.025em",
                          },
                        }}
                      >
                        {String(answer)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Education",
              value: answers.graduate === "yes" ? "Graduate" : "Non-Graduate",
            },
            { label: "MFA", value: answers.mfa === "yes" ? "Yes" : "No" },
            {
              label: "Exhibitions",
              value: `${answers.solo} Solo, ${answers.group} Group`,
            },
            {
              label: "Museum Features",
              value:
                answers.museum_collection || answers.museum_exhibition
                  ? "Yes"
                  : "No",
            },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-fluid-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="font-semibold text-fluid-xs text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
