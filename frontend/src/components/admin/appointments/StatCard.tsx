interface Props {
  value: number | string;
  label: string;
  accentColor: "blue" | "green" | "red" | "grey";
}

const accentMap: Record<string, string> = {
  blue: "border-l-blue-500",
  green: "border-l-green-600",
  red: "border-l-red-400",
  grey: "border-l-grey-400",
};

export default function StatCard({ value, label, accentColor }: Props) {
  return (
    <div
      className={`bg-white rounded-card px-6 py-5 shadow-card border-l-4 ${accentMap[accentColor]}`}
    >
      <div className="text-[2rem] font-bold text-grey-800 leading-none">{value}</div>
      <div className="text-[0.78rem] text-grey-600 mt-1.5 font-medium uppercase tracking-[0.04em]">
        {label}
      </div>
    </div>
  );
}
