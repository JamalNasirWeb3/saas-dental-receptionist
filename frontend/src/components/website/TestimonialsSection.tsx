const TESTIMONIALS = [
  {
    name: 'Emily R.',
    rating: 5,
    text: 'The team at BrightSmile is absolutely wonderful. The AI booking system made it so easy to schedule an appointment, and the cleaning was thorough and pain-free!',
    service: 'Dental Cleaning',
  },
  {
    name: 'Michael T.',
    rating: 5,
    text: "I was nervous about my tooth extraction but the dentist was so gentle and professional. The whole process was smooth from start to finish. Highly recommend!",
    service: 'Tooth Extraction',
  },
  {
    name: 'Sarah L.',
    rating: 5,
    text: "The whitening results were incredible — my teeth are noticeably brighter. Booking via the chatbot was so convenient, I didn't even have to call during office hours!",
    service: 'Teeth Whitening',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" style={{ color: '#f59e0b' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-grey-800 mb-3">What Our Patients Say</h2>
          <p className="text-grey-600 max-w-xl mx-auto">
            Don't take our word for it — here's what patients have to say about their
            BrightSmile experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-grey-50 border border-grey-200 rounded-[10px] p-6"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <Stars count={t.rating} />
              <p className="text-grey-700 text-sm leading-relaxed mt-3 mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-grey-800 text-sm">{t.name}</div>
                <div className="text-xs text-grey-400 mt-0.5">{t.service}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
