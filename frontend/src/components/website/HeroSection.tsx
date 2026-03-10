'use client';

function openChat() {
  window.dispatchEvent(new Event('open-chat'));
}

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-600 text-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-14">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Virtual Receptionist Available 24/7
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Your Brightest Smile<br />Starts Here
          </h1>

          <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
            BrightSmile Dental offers compassionate, comprehensive dental care for the
            whole family. Book your appointment in seconds with our AI receptionist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={openChat}
              className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-[10px] hover:bg-blue-50 transition-colors text-base cursor-pointer"
            >
              Book an Appointment
            </button>
            <a
              href="#services"
              className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-[10px] hover:bg-white/10 transition-colors text-base text-center"
            >
              Our Services
            </a>
          </div>

          {/* Trust stats */}
          <div className="flex gap-8 mt-12 justify-center md:justify-start">
            <div>
              <div className="text-3xl font-extrabold">15+</div>
              <div className="text-blue-200 text-sm">Years of Care</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-extrabold">5,000+</div>
              <div className="text-blue-200 text-sm">Happy Patients</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-extrabold">4.9★</div>
              <div className="text-blue-200 text-sm">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Decorative illustration */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-center w-80 h-80 rounded-full bg-white/10">
          <span className="text-[9rem] select-none">🦷</span>
        </div>
      </div>
    </section>
  );
}
