'use client';

function openChat() {
  window.dispatchEvent(new Event('open-chat'));
}

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 bg-white border-b border-grey-200"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🦷</span>
          <span className="font-extrabold text-blue-700 text-xl tracking-wide">BrightSmile</span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-grey-600">
          <a href="#services" className="hover:text-blue-700 transition-colors">Services</a>
          <a href="#why-us" className="hover:text-blue-700 transition-colors">About</a>
          <a href="#contact" className="hover:text-blue-700 transition-colors">Contact</a>
        </nav>

        {/* CTA */}
        <button
          onClick={openChat}
          className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-[8px] transition-colors cursor-pointer"
        >
          Book Appointment
        </button>
      </div>
    </header>
  );
}
