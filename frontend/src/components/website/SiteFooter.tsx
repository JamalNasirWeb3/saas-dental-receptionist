export default function SiteFooter() {
  return (
    <footer className="bg-grey-800 text-grey-400 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <span className="font-semibold text-white">BrightSmile Dental</span>
        </div>
        <p>© 2026 BrightSmile Dental. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
