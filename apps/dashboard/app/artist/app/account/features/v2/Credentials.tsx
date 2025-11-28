"use client";
import { useState } from "react";
import UpdateCredentialsModal from "./modals/UpdateCredentialsModal";
import { Award, User, Building, Globe, Download } from "lucide-react";
import { ArtistCategory } from "@omenai/shared-types";
import { downloadFile } from "@omenai/shared-lib/storage/downloadFile";
import { toast } from "sonner";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

type ArtistCategorizationAnswerTypes = {
  graduate: "yes" | "no";
  mfa: "yes" | "no";
  solo: number;
  group: number;
  museum_collection: "yes" | "no";
  biennale: "venice" | "other recognized biennale events" | "none";
  museum_exhibition: "yes" | "no";
  art_fair: "yes" | "no";
};

/* ---------- Helper UI Components ---------- */
function Card({
  icon,
  title,
  gradient,
  overlayIcon,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  overlayIcon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden p-4 rounded border border-line shadow-sm hover:shadow-lg transition-all duration-300 ${gradient}`}
    >
      {/* Large faint overlay icon */}
      <div className="absolute -bottom-6 -right-6 text-dark/5 scale-150">
        {overlayIcon}
      </div>

      {/* Header */}
      <div className="flex items-center space-x-3 mb-5 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <h3 className="text-fluid-base font-semibold text-dark">{title}</h3>
      </div>

      {/* Content */}
      <div className="space-y-4 relative z-10">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: "yes" | "no" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-fluid-xxs text-dark/60">{label}</span>
      <span
        className={`px-3 py-1 rounded text-fluid-xxs font-medium ${
          value === "yes"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-white"
        }`}
      >
        {value === "yes" ? "Yes" : "No"}
      </span>
    </div>
  );
}

function NumberStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-fluid-xxs text-dark/60">{label}</span>
      <span className="px-3 py-1 bg-dark/10 text-dark rounded-full text-fluid-xxs font-semibold">
        {value}
      </span>
    </div>
  );
}

function BadgeStat({
  label,
  value,
}: {
  label: string;
  value: "venice" | "other recognized biennale events" | "none";
}) {
  const map = {
    venice: { bg: "bg-purple-100", text: "text-purple-700", label: "Venice" },
    "other recognized biennale events": {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Other",
    },
    none: { bg: "bg-gray-200", text: "text-white", label: "None" },
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-fluid-xxs text-dark/60">{label}</span>
      <span
        className={`px-3 py-1 rounded text-fluid-xxs font-medium ${map[value].bg} ${map[value].text}`}
      >
        {map[value].label}
      </span>
    </div>
  );
}

/* ---------- Category Styles ---------- */
const categoryStyles: Record<
  ArtistCategory,
  { bg: string; text: string; border: string }
> = {
  Emerging: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Early Mid-Career": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  "Mid-Career": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Late Mid-Career": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  Established: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Elite: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

/* ---------- Main Component ---------- */
export default function Credentials({
  credentials,
  categorization,
  documentation,
}: {
  credentials: ArtistCategorizationAnswerTypes;
  categorization: ArtistCategory;
  documentation: { cv: string };
}) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  async function DownloadCV() {
    try {
      const fileUrl = await downloadFile(documentation.cv);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("");
      toast_notif("Failed to download CV", "error");
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Section Header */}
      <div className="border-line">
        <h2 className="text-fluid-md font-bold text-dark mb-1">
          Your Credentials
        </h2>
        <p className="text-fluid-xxs text-dark/60">
          A snapshot of your artistic journey and achievements
        </p>
      </div>
      {showVerificationModal && (
        <UpdateCredentialsModal
          setShowVerificationModal={setShowVerificationModal}
        />
      )}

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <Card
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          overlayIcon={<Award className="w-16 h-16" />}
          title="Education"
          gradient="bg-gradient-to-br from-emerald-50 to-white"
        >
          <Stat label="Bachelor's Degree" value={credentials.graduate} />
          <Stat label="MFA Degree" value={credentials.mfa} />
        </Card>

        {/* Exhibitions */}
        <Card
          icon={<User className="w-5 h-5 text-blue-600" />}
          overlayIcon={<User className="w-16 h-16" />}
          title="Exhibitions"
          gradient="bg-gradient-to-br from-blue-50 to-white"
        >
          <NumberStat label="Solo Exhibitions" value={credentials.solo} />
          <NumberStat label="Group Exhibitions" value={credentials.group} />
        </Card>

        {/* Museums */}
        <Card
          icon={<Building className="w-5 h-5 text-purple-600" />}
          overlayIcon={<Building className="w-16 h-16" />}
          title="Museums"
          gradient="bg-gradient-to-br from-purple-50 to-white"
        >
          <Stat
            label="Museum Collection"
            value={credentials.museum_collection}
          />
          <Stat
            label="Museum Exhibition"
            value={credentials.museum_exhibition}
          />
        </Card>

        {/* International */}
        <Card
          icon={<Globe className="w-5 h-5 text-indigo-600" />}
          overlayIcon={<Globe className="w-16 h-16" />}
          title="International"
          gradient="bg-gradient-to-br from-indigo-50 to-white"
        >
          <BadgeStat label="Biennale" value={credentials.biennale} />
          <Stat label="Art Fair" value={credentials.art_fair} />
        </Card>
      </div>

      {/* Categorization & Update Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
        <div className="flex items-center gap-x-3">
          <div
            className={`mt-2 px-4 py-2 rounded shadow-sm border ${categoryStyles[categorization].bg} ${categoryStyles[categorization].border}`}
          >
            <span
              className={`font-semibold text-fluid-base ${categoryStyles[categorization].text}`}
            >
              {categorization}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={DownloadCV}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-dark text-dark rounded font-normal text-fluid-xxs
                   hover:bg-dark/90 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Download CV</span>
          </button>
          {/* <button
            onClick={() => setShowVerificationModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-dark text-white rounded font-normal text-fluid-xxs
                   hover:bg-dark/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <Award className="w-5 h-5" />
            <span>Update Credentials</span>
          </button> */}
        </div>
      </div>
    </div>
  );
}
