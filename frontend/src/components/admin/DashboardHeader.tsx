interface Props {
  onRefresh: () => void;
  onLogout: () => void;
}

function RefreshSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

const btnGhost =
  "inline-flex items-center gap-1.5 px-4 py-2 rounded-[7px] border border-grey-300 bg-transparent text-grey-800 text-[0.88rem] font-medium cursor-pointer hover:bg-grey-100 transition-colors whitespace-nowrap no-underline";

export default function DashboardHeader({ onRefresh, onLogout }: Props) {
  return (
    <header className="flex items-center justify-between py-[18px] border-b border-grey-300 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-[2rem] leading-none">🦷</span>
        <div>
          <h1 className="text-[1.15rem] font-bold text-blue-700">Bright Smile Dental</h1>
          <span className="block text-[0.78rem] text-grey-600 mt-0.5">Admin Dashboard</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onRefresh} className={btnGhost}>
          <RefreshSVG />
          Refresh
        </button>
        <a href="/" className={btnGhost}>
          Chat UI
        </a>
        <button onClick={onLogout} className={btnGhost}>
          Logout
        </button>
      </div>
    </header>
  );
}
