import { useEffect, useState } from "react";
import type { GetStaticProps } from "next";
import path from "path";
import fs from "fs";

type HomeProps = {
  imagesFromFs: string[];
};

export default function Home({ imagesFromFs }: HomeProps) {
  /* ================= STATE ================= */
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"en" | "gr">("en");
  const [activeFilter, setActiveFilter] = useState("all");
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    images: string[];
    index: number;
  }>({ open: false, images: [], index: 0 });

  /* ================= LOAD SAVED LANGUAGE ================= */
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "gr") {
      setLang(savedLang);
    }
  }, []);

  /* ================= TEXTS ================= */
  const T = {
    en: {
      nav: ["Gallery", "About", "Contact"],
      heroTag: "Visual Storytelling",
      heroTitle1: "Capturing",
      heroTitle2: "Moments",
      heroTitle3: "in Time",
      heroText:
        "A curated collection of photographs exploring light, shadow, and the beauty of fleeting moments.",
      viewGallery: "View Gallery",
      galleryTitle: "Collections",
      aboutTitle1: "The Art",
      aboutTitle2: "of Seeing",
      aboutText: [
        "I'm a street photographer at the beginning of my journey, working with a quiet, observant approach to life in the city. I'm drawn to people -- strangers and friends alike -- and to the subtle moments that often go unnoticed in everyday urban spaces.",
        "Through street photography and portraiture, I focus on presence rather than spectacle. I'm interested in fleeting expressions, unguarded gestures, and the small pauses between movement and stillness. These moments reveal something honest about the person in front of the lens and the environment around them.",
        "My work moves between observation and interaction. I aim for images that feel intimate without being intrusive, allowing space for personality and quiet connection.",
        "Based in Athens.",
      ],
      contactTitle1: "Let’s Work",
      contactTitle2: "Together",
      contactCTA: "Send Message",
    },
    gr: {
      nav: ["Gallery", "About", "Contact"],
      heroTag: "Οπτική Αφήγηση",
      heroTitle1: "Αποτυπώνοντας",
      heroTitle2: "Στιγμές",
      heroTitle3: "στο Χρόνο",
      heroText:
        "Μια επιλεγμένη συλλογή φωτογραφιών που εξερευνά το φως, τη σκιά και την ομορφιά των στιγμών που περνούν.",
      viewGallery: "Δες τη Συλλογή",
      galleryTitle: "Συλλογές",
      aboutTitle1: "Η Τέχνη",
      aboutTitle2: "της Ματιάς",
      aboutText: [
        "Είμαι φωτογράφος δρόμου στην αρχή της διαδρομής μου, γοητευμένη από αυθόρμητες στιγμές στον αστικό χώρο.",
        "Η δουλειά μου εστιάζει στην ποίηση της καθημερινότητας — εκφράσεις, φως και κίνηση.",
        "Με έδρα την Αθήνα.",
      ],
      contactTitle1: "Ας Δουλέψουμε",
      contactTitle2: "Μαζί",
      contactCTA: "Αποστολή",
    },
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!lightbox.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox.open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox({ open: false, images: [], index: 0 });
        return;
      }
      if (e.key === "ArrowRight") {
        setLightbox((prev) => {
          if (!prev.open || prev.images.length < 2) return prev;
          return {
            ...prev,
            index: (prev.index + 1) % prev.images.length,
          };
        });
      }
      if (e.key === "ArrowLeft") {
        setLightbox((prev) => {
          if (!prev.open || prev.images.length < 2) return prev;
          return {
            ...prev,
            index:
              (prev.index - 1 + prev.images.length) % prev.images.length,
          };
        });
      }
    };
    if (lightbox.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.open]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const baseImages = imagesFromFs;

  const shuffle = (list: string[]) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    setImages(shuffle(baseImages));
  }, [baseImages]);

  const toSrc = (name: string) => `/images/${encodeURIComponent(name)}`;

  const parseTags = (name: string) => {
    const filename = name.split("/").pop() ?? "";
    const base = filename.replace(/\.[^/.]+$/, "");
    const parts = base.split("-");
    const tagParts = parts.slice(1);
    return tagParts.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  };

  const allTags = Array.from(new Set(images.flatMap(parseTags))).sort();

  const filters = ["all", ...allTags];
  const visibleImages =
    activeFilter === "all"
      ? images
      : images.filter((name) => parseTags(name).includes(activeFilter));

  return (
    <div className="bg-black text-white">
      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur border-b border-white/10 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="text-2xl font-serif tracking-wide"
          >
            Vayia Vs
          </button>

          <ul className="hidden md:flex items-center gap-8">
            {T[lang].nav.map((item) => (
              <li key={item}>
                <button
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-sm tracking-widest uppercase text-white/70 hover:text-white transition"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>

          {/* LANGUAGE TOGGLE */}
          <div className="flex items-center gap-3 text-sm tracking-widest uppercase">
            <button
              onClick={() => {
                setLang("en");
                localStorage.setItem("lang", "en");
              }}
              className={lang === "en" ? "text-white" : "text-white/40"}
            >
              EN
            </button>
            <span className="text-white/30">/</span>
            <button
              onClick={() => {
                setLang("gr");
                localStorage.setItem("lang", "gr");
              }}
              className={lang === "gr" ? "text-white" : "text-white/40"}
            >
              GR
            </button>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('/images/hero.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">
            {T[lang].heroTag}
          </p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-8">
            {T[lang].heroTitle1}
            <br />
            <span className="italic">{T[lang].heroTitle2}</span>{" "}
            {T[lang].heroTitle3}
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            {T[lang].heroText}
          </p>

          <button
            onClick={() => scrollTo("gallery")}
            className="inline-flex items-center gap-3 text-sm tracking-widest uppercase border-b border-white/40 pb-2 hover:text-white"
          >
            {T[lang].viewGallery} ↓
          </button>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section
        id="gallery"
        className="px-8 md:px-20 py-32 border-t border-white/10"
      >
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-20">
            {T[lang].galleryTitle}
          </h2>

          <div className="mb-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`border px-4 py-2 transition ${
                  activeFilter === filter
                    ? "border-white text-white"
                    : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
                }`}
              >
                {filter === "all"
                  ? "All"
                  : filter === "archit"
                    ? "Architecture"
                    : filter === "landsc"
                      ? "Landscape"
                      : filter === "int"
                        ? "Interior"
                        : filter === "street"
                          ? "Street Photography"
                          : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {visibleImages.map((name, index) => (
              <button
                key={name}
                type="button"
                className="w-full max-w-[420px] text-left"
                onClick={() =>
                  setLightbox({
                    open: true,
                    images: visibleImages,
                    index,
                  })
                }
              >
                <div className="h-80 sm:h-96 w-full overflow-hidden rounded-sm bg-white/10">
                  <img
                    src={toSrc(name)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="px-8 md:px-20 py-32 border-t border-white/10"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-6">
              About the work
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-8">
              {T[lang].aboutTitle1}{" "}
              <span className="italic">{T[lang].aboutTitle2}</span>
            </h2>

            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              {T[lang].aboutText.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-[11px] tracking-[0.35em] text-white/50">
              <span>#streetphotography</span>
              <span>#landscape</span>
              <span>#architecture</span>
              <span>#portrait</span>
              <span>#streetportrait</span>
              <span>#urban</span>
              <span>#citylife</span>
              <span>#documentary</span>
              <span>#blackandwhite</span>
              <span>#athens</span>
            </div>
          </div>

          <div className="lg:pl-6 lg:border-l lg:border-white/10">
            <div className="aspect-[3/4] w-full max-w-[480px] max-h-[72vh] overflow-hidden bg-white/10">
              <img
                src="/images/vayia.JPEG"
                alt="Vayia portrait"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-6 text-sm italic text-white/40">
              Quiet moments, honest presence
            </p>
          </div>
        </div>
      </section>

            {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="px-8 md:px-20 py-32 border-t border-white/10"
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.5em] uppercase text-white/60 mb-6">
            Get in touch
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            {T[lang].contactTitle1}
            <br />
            <span className="italic">{T[lang].contactTitle2}</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-12">
            Have a project in mind? I'd love to hear about it. Drop me a message
            and let's create something beautiful together.
          </p>

          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="space-y-10 text-left"
          >
            <input type="hidden" name="form-name" value="contact" />
            <div className="hidden">
              <label>
                Don't fill this out if you're human:
                <input name="bot-field" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <label className="block">
                <span className="block text-xs tracking-[0.3em] uppercase text-white/60 mb-4">
                  Name
                </span>
                <input
                  required
                  name="name"
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/50 transition"
                />
              </label>
              <label className="block">
                <span className="block text-xs tracking-[0.3em] uppercase text-white/60 mb-4">
                  Email
                </span>
                <input
                  required
                  name="email"
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/50 transition"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs tracking-[0.3em] uppercase text-white/60 mb-4">
                Message
              </span>
              <textarea
                required
                name="message"
                rows={4}
                placeholder="Tell me about your project..."
                className="w-full bg-transparent border-b border-white/20 py-3 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/50 transition"
              />
            </label>

            <div className="text-center pt-8">
              <button className="inline-flex items-center gap-3 border border-white bg-white px-12 py-4 text-xs tracking-[0.4em] uppercase text-black transition hover:bg-white/90">
                {T[lang].contactCTA}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 12l16-7-6 14-3-4-7-3z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>
      {/* ================= FOOTER ================= */}
      <footer className="bg-neutral-900 px-8 md:px-20 py-16 border-t border-white/10">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <img
            src="/images/MYWATERMARK.png"
            alt="Vayia signature"
            className="h-12 w-auto opacity-80"
          />
          <div className="flex items-center gap-6 text-sm tracking-wide">
            <a
              className="inline-flex items-center gap-2 text-white/60 hover:text-white"
              href="https://www.instagram.com/vayiavs/"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-80"
                style={{ color: "#e1306c" }}
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            <a className="inline-flex items-center gap-2 text-white/60 hover:text-white" href="#">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-80"
                style={{ color: "#1769ff" }}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9 7.5h4.2a2.8 2.8 0 0 1 0 5.6H9z" />
                <path d="M9 13.1h4.7a2.2 2.2 0 0 1 0 4.4H9z" />
              </svg>
              Behance
            </a>
          </div>
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>

      {/* ================= LIGHTBOX ================= */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 p-6 overflow-y-auto"
          onClick={() =>
            setLightbox({ open: false, images: [], index: 0 })
          }
        >
          <div
            className="relative max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 bg-black/80 px-2 py-2 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Esc close
                {lightbox.images.length > 1 ? " / Left-Right to navigate" : ""}
              </p>
              <button
                type="button"
                className="text-white/70 hover:text-white"
                onClick={() =>
                  setLightbox({
                    open: false,
                    images: [],
                    index: 0,
                  })
                }
              >
                Close
              </button>
            </div>
            <div className="relative flex items-center justify-center pt-10">
              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/80 hover:border-white/60 hover:text-white"
                    onClick={() =>
                      setLightbox((prev) => ({
                        ...prev,
                        index:
                          (prev.index - 1 + prev.images.length) %
                          prev.images.length,
                      }))
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/80 hover:border-white/60 hover:text-white"
                    onClick={() =>
                      setLightbox((prev) => ({
                        ...prev,
                        index: (prev.index + 1) % prev.images.length,
                      }))
                    }
                  >
                    Next
                  </button>
                </>
              )}
              <img
                src={toSrc(lightbox.images[lightbox.index])}
                alt=""
                className="max-h-[70vh] max-w-[90vw] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const entries = fs.readdirSync(imagesDir, { withFileTypes: true });
  const imagesFromFs = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
    .filter((name) => {
      const base = name.replace(/\.[^/.]+$/, "");
      return base.split("-").length > 1;
    })
    .sort();

  return {
    props: {
      imagesFromFs,
    },
  };
};







