const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 to-white">
      {/* Poster Image */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-8 flex justify-center">
        <img
          src="/poster-cover.jpg"
          alt="Children's Day 2026: Survivor and Nature Play - ฝ่าวิกฤติด้วยวิถีธรรมชาติ"
          className="w-full max-w-3xl h-auto rounded-xl sm:rounded-2xl shadow-2xl animate-fade-up"
        />
      </div>

      {/* CTA Button */}
      <div className="relative z-10 pb-8 sm:pb-16 px-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => scrollToSection('donate')}
          className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center gap-2 sm:gap-3 group w-full sm:w-auto justify-center"
        >
          สนับสนุนโครงการ
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
