type Props = {
  activeTab: "info" | "credentials" | "settings";
  onChange: (tab: "info" | "credentials" | "settings") => void;
};

export default function Tabs({ activeTab, onChange }: Props) {
  const tabs = [
    { id: "info", label: "Account Information" },
    { id: "credentials", label: "Credentials" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <div className="flex border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3 text-fluid-xs font-medium transition-colors
            ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-gray-light hover:text-primary"}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
