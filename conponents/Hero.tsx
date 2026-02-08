const Hero = () => {
  const scrollToGallery = () => {
    const element = document.getElementById("gallery");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: "url('/images/hero.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <p className="tracking-[0.3em] uppercase text-sm text-gray-300 mb-6">
          Visual Storytelling
        </p>

        <h1 className="text-5xl md:text-7xl font-serif text-white mb-8">
          Capturing <br />
          <span className="italic">Moments</span> in Time
        </h1>

        <button
          onClick={scrollToGallery}
          className="uppercase tracking-widest text-sm text-white border-b border-white/40 hover:border-white transition"
        >
          View Gallery
        </button>
      </div>
    </section>
  );
};

export default Hero;
