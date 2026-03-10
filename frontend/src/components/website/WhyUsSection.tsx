const STATS = [
  { number: '15+', label: 'Years of Experience' },
  { number: '5,000+', label: 'Patients Served' },
  { number: '4.9/5', label: 'Patient Rating' },
  { number: '6', label: 'Dental Specialists' },
];

const FEATURES = [
  {
    emoji: '⏰',
    title: 'Flexible Scheduling',
    desc: 'Open Monday–Friday 9 am–5 pm and Saturdays 9 am–1 pm. Book any time via our AI receptionist.',
  },
  {
    emoji: '🛡️',
    title: 'Insurance Accepted',
    desc: 'We work with most major insurance providers. Ask about our flexible payment plans.',
  },
  {
    emoji: '💉',
    title: 'Pain-Free Treatment',
    desc: 'We use the latest techniques and technology to ensure your comfort throughout every procedure.',
  },
  {
    emoji: '📱',
    title: '24/7 AI Receptionist',
    desc: 'Book, cancel, or check your appointments any time of day using our intelligent chat assistant.',
  },
];

export default function WhyUsSection() {
  return (
    <section id="why-us" className="py-20 px-6 bg-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-grey-800 mb-3">Why Choose BrightSmile?</h2>
          <p className="text-grey-600 max-w-xl mx-auto">
            We combine clinical excellence with genuine care to deliver the best dental
            experience in the city.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-[10px] p-6 text-center border border-grey-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="text-3xl font-extrabold text-blue-700 mb-1">{s.number}</div>
              <div className="text-sm text-grey-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 bg-white rounded-[10px] p-6 border border-grey-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="text-3xl flex-shrink-0">{f.emoji}</div>
              <div>
                <h3 className="font-bold text-grey-800 mb-1">{f.title}</h3>
                <p className="text-sm text-grey-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
