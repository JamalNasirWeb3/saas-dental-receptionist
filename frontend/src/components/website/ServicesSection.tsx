const SERVICES = [
  {
    emoji: '🧹',
    title: 'Dental Cleaning',
    desc: 'Comprehensive teeth cleaning and professional plaque removal to keep your smile healthy.',
  },
  {
    emoji: '🔍',
    title: 'General Checkup',
    desc: 'Regular dental examinations and X-rays to catch problems before they become serious.',
  },
  {
    emoji: '🔧',
    title: 'Tooth Filling',
    desc: 'Cavity treatment using natural-looking composite fillings that blend seamlessly with your teeth.',
  },
  {
    emoji: '🦷',
    title: 'Tooth Extraction',
    desc: 'Safe and gentle removal of damaged or wisdom teeth with minimal discomfort.',
  },
  {
    emoji: '✨',
    title: 'Teeth Whitening',
    desc: 'Professional-grade whitening treatment to brighten your smile by several shades.',
  },
  {
    emoji: '🚨',
    title: 'Emergency Care',
    desc: 'Urgent same-day dental care for severe pain, broken teeth, and dental emergencies.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-grey-800 mb-3">Our Services</h2>
          <p className="text-grey-600 max-w-xl mx-auto">
            Comprehensive dental care tailored to you and your family's needs, delivered
            with the latest technology and a gentle touch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="bg-grey-50 border border-grey-200 rounded-[10px] p-6 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h3 className="font-bold text-grey-800 text-lg mb-2">{s.title}</h3>
              <p className="text-grey-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
