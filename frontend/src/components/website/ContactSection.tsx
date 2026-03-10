'use client';

function openChat() {
  window.dispatchEvent(new Event('open-chat'));
}

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-6 bg-blue-700 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Find Us &amp; Get in Touch</h2>
          <p className="text-blue-200 max-w-xl mx-auto">
            We&apos;re conveniently located and always ready to help. Walk-ins welcome
            for emergency care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Location */}
          <div className="bg-white/10 rounded-[10px] p-6">
            <div className="text-2xl mb-3">📍</div>
            <h3 className="font-bold text-lg mb-2">Location</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              123 Smile Avenue<br />
              Suite 200<br />
              New York, NY 10001
            </p>
          </div>

          {/* Hours */}
          <div className="bg-white/10 rounded-[10px] p-6">
            <div className="text-2xl mb-3">🕐</div>
            <h3 className="font-bold text-lg mb-2">Office Hours</h3>
            <div className="text-blue-100 text-sm space-y-1.5">
              <div className="flex justify-between gap-4">
                <span>Mon – Fri</span>
                <span>9:00 AM – 5:00 PM</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Saturday</span>
                <span>9:00 AM – 1:00 PM</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/10 rounded-[10px] p-6">
            <div className="text-2xl mb-3">📞</div>
            <h3 className="font-bold text-lg mb-2">Contact</h3>
            <div className="text-blue-100 text-sm space-y-2">
              <p>📞 (555) 123-4567</p>
              <p>✉️ hello@brightsmile.dental</p>
              <p className="text-blue-300 text-xs mt-3 leading-relaxed">
                For emergencies after hours, chat with our AI receptionist below.
              </p>
            </div>
            <button
              onClick={openChat}
              className="mt-5 w-full bg-white text-blue-700 font-semibold text-sm py-2.5 rounded-[8px] hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Chat with Us Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
