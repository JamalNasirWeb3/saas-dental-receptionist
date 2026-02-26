type Tab = "appointments" | "settings";

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabNav({ activeTab, onChange }: Props) {
  return (
    <nav className="flex gap-1 border-b-2 border-grey-300 mb-6">
      {(["appointments", "settings"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-5 py-2.5 border-0 bg-transparent cursor-pointer text-[0.9rem] font-medium border-b-2 mb-[-2px] transition-colors capitalize ${
            activeTab === tab
              ? "text-blue-600 border-b-blue-600"
              : "text-grey-600 border-b-transparent hover:text-grey-800"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
