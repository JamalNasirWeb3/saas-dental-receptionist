interface Props {
  isMuted: boolean;
  onMuteToggle: () => void;
  lang: string;
  onLangChange: (lang: string) => void;
}

function SpeakerSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function MutedSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1={23} y1={9} x2={17} y2={15} />
      <line x1={17} y1={9} x2={23} y2={15} />
    </svg>
  );
}

export default function ChatHeader({ isMuted, onMuteToggle, lang, onLangChange }: Props) {
  return (
    <header className="flex items-center gap-3 px-5 py-[14px] bg-blue-700 text-white flex-shrink-0">
      <div className="text-[2rem] leading-none">🦷</div>
      <div className="flex flex-col gap-[3px]">
        <h1 className="text-[1.1rem] font-bold tracking-wide">Bright Smile Dental</h1>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-[#4caf50] mr-1.5" />
          <span className="text-[0.78rem] opacity-85">Virtual Receptionist · Online</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onMuteToggle}
          aria-label={isMuted ? "Unmute voice output" : "Mute voice output"}
          title="Mute/Unmute voice"
          className={`bg-transparent border-0 cursor-pointer p-1 rounded flex items-center justify-center transition-colors ${
            isMuted ? "text-grey-400" : "text-blue-100 hover:text-white"
          }`}
        >
          {isMuted ? <MutedSVG /> : <SpeakerSVG />}
        </button>
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value)}
          aria-label="Language"
          className="text-[0.8rem] border border-blue-300 rounded-[6px] px-1.5 py-0.5 bg-white text-blue-700 cursor-pointer"
        >
          <option value="en">English</option>
        </select>
      </div>
    </header>
  );
}
