import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GetStaticProps } from "next";
import Image from "next/image";
import path from "path";
import fs from "fs";

type HomeProps = {
  imagesFromFs: string[];
};

const curatedImageOrder = [
  "ist8-street.jpg",
  "rome2-archit.png",
  "greece1-landsc.png",
  "skg1-street-int.jpg",
  "ist1-archit-int.png",
  "rome7-street.png",
  "greece3-street.png",
  "ist15-landsc.jpg",
  "rome8-archit-int.png",
  "skg2-street.png",
  "ist10-street.png",
  "rome4-int.png",
  "greece2-landsc.png",
  "ist7-archit.png",
  "rome1-street.png",
  "greece5-street.png",
  "ist9-archit.png",
  "skg3-street.png",
  "rome3-archit-int.png",
  "ist4-street.jpg",
  "greece4-street.png",
  "rome6-archit.png",
  "ist11-street.png",
  "ist2-street.jpg",
  "ist14-street.png",
  "ist5-street.jpg",
  "ist12-street.png",
  "ist3-street.jpg",
  "ist13-street.png",
  "ist6-street.jpg",
  "ist7-street.jpg",
];

const ServiceIcon = ({ name }: { name: string }) => {
  const iconProps = {
    "aria-hidden": true,
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "product") {
    return (
      <svg {...iconProps}>
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  if (name === "content") {
    return (
      <svg {...iconProps}>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M10 7h4" />
        <path d="M9 16h6" />
        <path d="M12 19h.01" />
      </svg>
    );
  }

  if (name === "walks") {
    return (
      <svg {...iconProps}>
        <path d="M4 20h16" />
        <path d="M6 20V9l4-3 4 3v11" />
        <path d="M14 20V7l4 2v11" />
        <path d="M9 13h2" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M4 9h3l1.5-2h7L17 9h3v10H4V9z" />
      <circle cx="12" cy="14" r="3" />
      <path d="M7 11h.01" />
    </svg>
  );
};

export default function Home({ imagesFromFs }: HomeProps) {
  /* ================= STATE ================= */
  const [scrolled, setScrolled] = useState(false);
  const [isAtPageBottom, setIsAtPageBottom] = useState(false);
  const [lang, setLang] = useState<"en" | "gr">("en");
  const [viewMode, setViewMode] = useState<"auto" | "mobile" | "desktop">("auto");
  const [hasChosenView, setHasChosenView] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(5); // Gallery items shown
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    images: string[];
    index: number;
  }>({ open: false, images: [], index: 0 });
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "none">("none");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ================= LOAD SAVED LANGUAGE & VIEW MODE ================= */
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "gr") {
      // Restores the user's browser-only preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(savedLang);
    }
    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode === "mobile" || savedViewMode === "desktop" || savedViewMode === "auto") {
      setViewMode(savedViewMode);
    }
    // Check if user already chose view mode
    const hasChosen = localStorage.getItem("hasChosenView");
    if (hasChosen === "true") {
      setHasChosenView(true);
    } else {
      setHasChosenView(false);
    }
  }, []);

  /* ================= TEXTS ================= */
  const T = {
    en: {
      nav: [
        { label: "Gallery", target: "gallery" },
        { label: "About", target: "about" },
        { label: "Contact", target: "contact" },
      ],
      heroTag: "Visual Storytelling",
      heroTitle1: "Capturing",
      heroTitle2: "Moments",
      heroTitle3: "in Time",
      heroText:
        "A curated collection of photographs exploring light, shadow, and the beauty of fleeting moments.",
      viewGallery: "View Gallery",
      galleryTitle: "Collections",
      showMore: "Show More",
      aboutTitle1: "The Art",
      aboutTitle2: "of Seeing",
      aboutKicker: "About the work",
      aboutText: [
        "I'm a street photographer at the beginning of my journey, working with a quiet, observant approach to life in the city. I'm drawn to people -- strangers and friends alike -- and to the subtle moments that often go unnoticed in everyday urban spaces.",
        "Through street photography and portraiture, I focus on presence rather than spectacle. I'm interested in fleeting expressions, unguarded gestures, and the small pauses between movement and stillness. These moments reveal something honest about the person in front of the lens and the environment around them.",
        "My work moves between observation and interaction. I aim for images that feel intimate without being intrusive, allowing space for personality and quiet connection.",
        "Based in Athens.",
      ],
      contactTitle1: "Let's Work",
      contactTitle2: "Together",
      contactKicker: "Get in touch",
      contactText:
        "Have a project in mind? I'd love to hear about it. Drop me a message and let's create something beautiful together.",
      contactEmail: "vayiavs95@gmail.com",
      formName: "Name",
      formNamePlaceholder: "Your name",
      formEmail: "Email",
      formEmailPlaceholder: "your@email.com",
      formMessage: "Message",
      formMessagePlaceholder: "Tell me what you have in mind...",
      contactCTA: "Send Message",
      servicesKicker: "Work with me",
      servicesTitle: "",
      services: [
        {
          icon: "portrait",
          title: "Portrait Sessions",
          text: "Personal portraits, headshots, or intimate photo sessions in Athens or around you.",
        },
        {
          icon: "product",
          title: "Product Photography",
          text: "For online shops, small businesses, and brands. Showcase your products beautifully.",
        },
        {
          icon: "content",
          title: "Instagram Content",
          text: "Content creation for brands and creators. Feed-ready, story-ready content.",
        },
        {
          icon: "walks",
          title: "Street Photography Walks",
          text: "Guided photography walks exploring light, movement, and urban stories together.",
        },
      ],
      inquire: "Inquire",
      portraitCaption: "Quiet moments, honest presence",
    },
    gr: {
      nav: [
        { label: "Οι Συλλογές μου", target: "gallery" },
        { label: "Σχετικά με εμένα", target: "about" },
        { label: "Επικοινωνία", target: "contact" },
      ],
      heroTag: "Φωτογραφικές Ιστορίες",
      heroTitle1: "Στιγμές",
      heroTitle2: "που",
      heroTitle3: "μένουν",
      heroText:
        "Ό,τι περνάει απαρατήρητο — μέχρι να το δεις.",
      viewGallery: "Περιήγηση",
      galleryTitle: "Συλλογές",
      showMore: "Δες περισσότερες",
      aboutTitle1: "Το βλέμμα",
      aboutTitle2: "πίσω από τον φακό",
      aboutKicker: "Λίγα λόγια",
      aboutText: [
        "Με ενδιαφέρει η αυθεντικότητα — άνθρωποι και χώροι χωρίς σκηνοθεσία.",
        "Ένα βλέμμα που διαρκεί λίγο περισσότερο. Μια σκιά που αλλάζει τον χώρο. Στιγμές που δεν επαναλαμβάνονται.",
        "Η φωτογραφία είναι για μένα επιλογή στιγμής· μια προσπάθεια να σταματήσει ο χρόνος εκεί όπου υπάρχει αλήθεια.",
        "Street, portrait, architecture — ένας ήσυχος, προσωπικός ρυθμός.",
        "Με αφετηρία την Αθήνα.",
      ],
      contactTitle1: "Επικοινώνησε",
      contactTitle2: "Εδώ",
      contactKicker: "Επικοινωνία",
      contactText:
        "Αν έχεις μια ιδέα, ένα project ή απλώς θέλεις να μιλήσουμε για φωτογράφιση, στείλε μου μήνυμα και θα χαρώ να το δούμε μαζί.",
      contactEmail: "vayiavs95@gmail.com",
      formName: "ΟΝΟΜΑ",
      formNamePlaceholder: "Το όνομά σου",
      formEmail: "EMAIL",
      formEmailPlaceholder: "το@email σου",
      formMessage: "ΜΗΝΥΜΑ",
      formMessagePlaceholder: "Πες μου τι έχεις στο μυαλό σου...",
      contactCTA: "Αποστολή",
      servicesKicker: "Συνεργασία",
      servicesTitle: "",
      services: [
        {
          icon: "portrait",
          title: "Πορτρέτα",
          text: "Προσωπικά πορτρέτα, headshots ή πιο ήσυχες φωτογραφίσεις στην Αθήνα και όπου σε βολεύει.",
        },
        {
          icon: "product",
          title: "Φωτογράφιση Προϊόντων",
          text: "Φωτογραφίες για μικρές επιχειρήσεις, e-shops και brands που θέλουν καθαρή και προσεγμένη εικόνα.",
        },
        {
          icon: "content",
          title: "Περιεχόμενο Instagram",
          text: "Περιεχόμενο για social media, με εικόνες έτοιμες για feed, stories και καμπάνιες.",
        },
        {
          icon: "walks",
          title: "Φωτογραφικές Βόλτες",
          text: "Βόλτες φωτογραφίας στην πόλη, με έμφαση στο φως, την κίνηση και το πώς παρατηρούμε τον χώρο.",
        },
      ],
      inquire: "Ρώτησέ με",
      portraitCaption: "Ήσυχες στιγμές, αληθινή παρουσία",
    },
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const pageBottom =
        document.documentElement.scrollHeight - (scrollY + window.innerHeight);

      setScrolled(scrollY > 50);
      setIsAtPageBottom(pageBottom < 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!lightbox.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox.open]);

  const openLightbox = (lightboxImages: string[], index: number) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setIsLightboxClosing(false);
    setSlideDirection("none");
    setLightbox({
      open: true,
      images: lightboxImages,
      index,
    });
  };

  const closeLightbox = useCallback(() => {
    if (!lightbox.open || isLightboxClosing) return;
    setIsLightboxClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setLightbox({ open: false, images: [], index: 0 });
      setIsLightboxClosing(false);
      setSlideDirection("none");
    }, 240);
  }, [isLightboxClosing, lightbox.open]);

  const moveLightbox = useCallback((direction: "next" | "prev") => {
    setSlideDirection(direction);
    setLightbox((prev) => {
      if (!prev.open || prev.images.length < 2) return prev;
      const offset = direction === "next" ? 1 : -1;
      return {
        ...prev,
        index: (prev.index + offset + prev.images.length) % prev.images.length,
      };
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowRight") {
        moveLightbox("next");
      }
      if (e.key === "ArrowLeft") {
        moveLightbox("prev");
      }
    };
    if (lightbox.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox, lightbox.open, moveLightbox]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const images = useMemo(() => {
    const rankedImages = new Map(
      curatedImageOrder.map((name, index) => [name, index]),
    );

    return [...imagesFromFs].sort((a, b) => {
      const aRank = rankedImages.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bRank = rankedImages.get(b) ?? Number.MAX_SAFE_INTEGER;

      if (aRank !== bRank) return aRank - bRank;
      return a.localeCompare(b);
    });
  }, [imagesFromFs]);

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
  const isDesktopGallery = viewMode === "desktop";
  const galleryContainerClass = isDesktopGallery
    ? "mx-auto w-full max-w-[1600px] px-2 sm:px-0 relative z-10"
    : "mx-auto w-full max-w-6xl px-2 sm:px-0 relative z-10";
  const galleryGridClass = isDesktopGallery
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 justify-items-stretch"
    : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-10 justify-items-center";
  const galleryImageSizes = isDesktopGallery
    ? "(min-width: 1280px) 18vw, (min-width: 1024px) 20vw, 33vw"
    : "(min-width: 1024px) 33vw, 50vw";

  return (
    <div className="bg-black text-white">
      {/* ================= SPLASH SCREEN ================= */}
      {!hasChosenView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="text-center space-y-12 px-6 py-12 bg-gray-900/90 rounded-2xl border border-amber-500/20 backdrop-blur">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">Welcome</h2>
              <p className="text-white/60 text-lg">Choose your preferred view:</p>
            </div>

            {/* View Mode Selection */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => {
                  setViewMode("mobile");
                  localStorage.setItem("viewMode", "mobile");
                  localStorage.setItem("hasChosenView", "true");
                  setHasChosenView(true);
                }}
                className="group px-8 py-6 rounded-xl border-2 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 transition space-y-3"
              >
                <div className="text-5xl">📱</div>
                <div className="text-white font-medium">Mobile View</div>
                <div className="text-sm text-white/50">Optimized for phones</div>
              </button>

              <button
                onClick={() => {
                  setViewMode("desktop");
                  localStorage.setItem("viewMode", "desktop");
                  localStorage.setItem("hasChosenView", "true");
                  setHasChosenView(true);
                }}
                className="group px-8 py-6 rounded-xl border-2 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 transition space-y-3"
              >
                <div className="text-5xl">🖥️</div>
                <div className="text-white font-medium">Desktop View</div>
                <div className="text-sm text-white/50">Large images & layout</div>
              </button>
            </div>

            <p className="text-xs text-white/40">You can change this anytime in the header →</p>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/85 backdrop-blur border-b border-[#d7b46a]/25 py-4"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <p className="justify-self-start text-sm font-light uppercase tracking-[0.34em] text-white/85 sm:text-base lg:text-lg">
            Vayia Vasileiou
          </p>

          <ul className="hidden items-center justify-self-center md:flex md:gap-4 lg:gap-8">
            {T[lang].nav.map((item) => (
              <li key={item.target}>
                <button
                  onClick={() => scrollTo(item.target)}
                  className="rounded border border-transparent px-3 py-2 text-xs tracking-[0.22em] uppercase text-white/70 transition hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa] lg:text-sm"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* LANGUAGE & VIEW MODE TOGGLE */}
          <div className="flex items-center justify-self-end gap-3 sm:gap-5">
            {/* VIEW MODE */}
            <div className="flex items-center gap-2 text-[10px] sm:text-xs tracking-widest uppercase">
              <button
                onClick={() => {
                  setViewMode("mobile");
                  localStorage.setItem("viewMode", "mobile");
                }}
                title="Mobile view"
                className={`rounded border px-2 py-1 transition ${
                  viewMode === "mobile"
                    ? "border-[#d7b46a] bg-[#d7b46a]/20 text-[#f6dfaa]"
                    : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                }`}
              >
                📱
              </button>
              <button
                onClick={() => {
                  setViewMode("desktop");
                  localStorage.setItem("viewMode", "desktop");
                }}
                title="Desktop view"
                className={`rounded border px-2 py-1 transition ${
                  viewMode === "desktop"
                    ? "border-[#d7b46a] bg-[#d7b46a]/20 text-[#f6dfaa]"
                    : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                }`}
              >
                🖥️
              </button>
            </div>

            {/* LANGUAGE */}
            <div className="flex items-center gap-3 text-sm tracking-widest uppercase border-l border-white/10 pl-4 sm:pl-6">
              <button
                onClick={() => {
                  setLang("en");
                  localStorage.setItem("lang", "en");
                }}
                className={`rounded border px-2 py-1 transition ${
                  lang === "en"
                    ? "border-[#d7b46a] bg-[#d7b46a]/15 text-[#f6dfaa]"
                    : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                }`}
              >
                EN
              </button>
              <span className="text-white/30">/</span>
              <button
                onClick={() => {
                  setLang("gr");
                  localStorage.setItem("lang", "gr");
                }}
                className={`rounded border px-2 py-1 transition ${
                  lang === "gr"
                    ? "border-[#d7b46a] bg-[#d7b46a]/15 text-[#f6dfaa]"
                    : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                }`}
              >
                GR
              </button>
            </div>
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/78" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">
            {T[lang].heroTag}
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-12">
            {lang === "gr" ? (
              <>
                {T[lang].heroTitle1}{" "}
                <span className="italic">{T[lang].heroTitle2}</span>{" "}
                {T[lang].heroTitle3}
              </>
            ) : (
              <>
                {T[lang].heroTitle1}
                <br />
                <span className="italic">{T[lang].heroTitle2}</span>{" "}
                {T[lang].heroTitle3}
              </>
            )}
          </h1>

          <p
            className={`mx-auto mb-12 text-base leading-relaxed text-white/65 sm:text-lg md:text-lg ${
              lang === "en"
                ? "max-w-5xl lg:whitespace-nowrap"
                : "max-w-xl"
            }`}
          >
            {T[lang].heroText}
          </p>

          <button
            onClick={() => scrollTo("gallery")}
            className="inline-flex items-center gap-3 border-b border-white/40 pb-2 text-sm uppercase tracking-widest transition hover:border-[#d7b46a] hover:font-bold hover:text-[#f6dfaa]"
          >
            {T[lang].viewGallery} ↓
          </button>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section
        id="gallery"
        className="gallery-backdrop px-4 sm:px-8 md:px-20 py-20 md:py-32 border-t border-white/10 relative overflow-hidden"
      >
        <div className={galleryContainerClass}>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-10 md:mb-20 text-white">
              {T[lang].galleryTitle}
            </h2>

          <div className="mb-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded border px-3 sm:px-4 py-2 font-normal uppercase tracking-[0.3em] transition ${
                  activeFilter === filter
                    ? "border-[#d7b46a] bg-[#d7b46a] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)]"
                    : "border-[#d7b46a]/60 bg-[#d7b46a]/10 text-[#f6dfaa] hover:border-[#f6dfaa] hover:bg-[#d7b46a] hover:text-black"
                }`}
              >
                {filter === "all"
                  ? "ALL"
                  : filter === "archit"
                    ? "ARCHITECTURE"
                    : filter === "landsc"
                      ? "LANDSCAPE"
                      : filter === "int"
                        ? "INTERIOR"
                        : filter === "street"
                          ? "STREET PHOTOGRAPHY"
                          : filter.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={galleryGridClass}>
            {(viewMode === "desktop" ? visibleImages : visibleImages.slice(0, itemsToShow)).map((name, index) => {
              // Determine height based on viewMode
              const heightClass = viewMode === "mobile" 
                ? "h-40 sm:h-56 md:h-72 lg:h-96"
                : viewMode === "desktop"
                ? "h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96"
                : "h-40 sm:h-56 md:h-72 lg:h-96"; // auto defaults to mobile
              const itemClass = isDesktopGallery
                ? "animate-gallery-item w-full text-left group"
                : "animate-gallery-item w-full max-w-[420px] text-left group";
              
              return (
                <button
                  key={`${activeFilter}-${name}`}
                  type="button"
                  className={itemClass}
                  style={{ animationDelay: `${Math.min(index, 14) * 90}ms` }}
                  onClick={() => openLightbox(visibleImages, index)}
                >
                  <div className={`${heightClass} w-full overflow-hidden rounded-lg border border-transparent bg-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.34)] relative group transition-all duration-300 transform hover:scale-105 hover:border-[#d7b46a] hover:ring-2 hover:ring-[#f6dfaa]/70 hover:shadow-[0_18px_55px_rgba(0,0,0,0.34),0_0_28px_rgba(215,180,106,0.3)]`}>
                    <Image
                      src={toSrc(name)}
                      alt=""
                      fill
                      sizes={galleryImageSizes}
                      className="object-cover"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* SHOW MORE BUTTON - MOBILE ONLY */}
          {viewMode !== "desktop" && visibleImages.length > itemsToShow && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setItemsToShow(itemsToShow + 5)}
                className="rounded border border-[#d7b46a] bg-[#d7b46a] px-6 sm:px-8 py-3 text-sm uppercase tracking-widest text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)]"
              >
                {T[lang].showMore} ↓
              </button>
            </div>
          )}
        </div>

      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="px-4 sm:px-8 md:px-16 xl:px-20 py-18 md:py-24 xl:py-28 border-t border-white/10"
      >
        <div className="ml-auto mr-0 grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-white/50">
              {T[lang].aboutKicker}
            </p>
            <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl xl:text-5xl">
              {T[lang].aboutTitle1}{" "}
              <span className="italic">{T[lang].aboutTitle2}</span>
            </h2>

            <div className="space-y-4 text-sm leading-7 text-white/70 sm:text-base xl:space-y-5">
              {T[lang].aboutText.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-x-3 gap-y-2 text-[10px] tracking-[0.35em] text-[#d7b46a]">
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

          <div className="lg:border-l lg:border-white/10 lg:pl-8">
            <div className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden bg-white/10">
              <Image
                src="/images/vayia.JPEG"
                alt="Vayia portrait"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-sm italic text-white/40">
              {T[lang].portraitCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ================= COLLABORATION ================= */}
      <section className="gallery-backdrop px-4 sm:px-8 md:px-20 py-20 md:py-32 border-t border-white/10 relative overflow-hidden">
        <div className="relative z-10 ml-0 mr-auto max-w-6xl">
          <p className="text-xs tracking-[0.4em] uppercase text-white/50 mb-6">
            {T[lang].servicesKicker}
          </p>
          {T[lang].servicesTitle && (
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-12">
              {T[lang].servicesTitle}
            </h2>
          )}

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {T[lang].services.map((service) => (
                <div
                  key={service.title}
                  className="border border-[#d7b46a]/45 rounded-lg p-6 sm:p-8 transition hover:border-[#f6dfaa] hover:bg-[#d7b46a]/8 hover:shadow-[0_0_24px_rgba(215,180,106,0.16)]"
                >
                  <div className="mb-7 text-[#d7b46a]">
                    <ServiceIcon name={service.icon} />
                  </div>
                  <h3 className="font-serif text-2xl mb-3">{service.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{service.text}</p>
                  <a href="#contact" className="text-[#d7b46a] hover:text-[#f6dfaa] text-sm uppercase tracking-widest transition">
                    {T[lang].inquire} →
                  </a>
                </div>
              ))}
            </div>
            <div className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-lg border border-white/15 bg-black/30 shadow-[0_18px_55px_rgba(0,0,0,0.34)] lg:sticky lg:top-28">
              <Image
                src="/images/ist8-street.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-black/15" />
            </div>
          </div>
        </div>
      </section>

            {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="px-4 sm:px-8 md:px-20 py-20 md:py-32 border-t border-white/10"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs tracking-[0.5em] uppercase text-white/60 mb-6">
            {T[lang].contactKicker}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
            {T[lang].contactTitle1}{" "}
            <span className="italic">{T[lang].contactTitle2}</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-12">
            {T[lang].contactText}
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
                Don&apos;t fill this out if you&apos;re human:
                <input name="bot-field" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <label className="block">
                <span className="block text-xs tracking-[0.42em] uppercase text-white/70 mb-4">
                  {T[lang].formName}
                </span>
                <input
                  required
                  name="name"
                  placeholder={T[lang].formNamePlaceholder}
                  className="w-full bg-transparent border-b border-white/30 py-3 text-white/80 placeholder:text-white/35 focus:outline-none focus:border-[#d7b46a]/80 transition"
                />
              </label>
              <label className="block">
                <span className="block text-xs tracking-[0.42em] uppercase text-white/70 mb-4">
                  {T[lang].formEmail}
                </span>
                <input
                  required
                  name="email"
                  placeholder={T[lang].formEmailPlaceholder}
                  className="w-full bg-transparent border-b border-white/30 py-3 text-white/80 placeholder:text-white/35 focus:outline-none focus:border-[#d7b46a]/80 transition"
                />
              </label>
            </div>

            <label className="block">
                <span className="block text-xs tracking-[0.42em] uppercase text-white/70 mb-4">
                {T[lang].formMessage}
              </span>
              <textarea
                required
                name="message"
                rows={4}
                placeholder={T[lang].formMessagePlaceholder}
                className="w-full bg-transparent border-b border-white/30 py-3 text-white/80 placeholder:text-white/35 focus:outline-none focus:border-[#d7b46a]/80 transition"
              />
            </label>

            <div className="text-center pt-8">
              <button className="inline-flex items-center gap-2 sm:gap-3 border border-white bg-white px-6 sm:px-12 py-3 sm:py-4 text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase text-black transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black hover:shadow-[0_0_28px_rgba(215,180,106,0.3)]">
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
      <footer className="bg-[#111716] px-4 sm:px-8 md:px-20 py-6 border-t border-white/10">
        <div className="grid items-center gap-6 text-center md:grid-cols-[1fr_auto_1fr] md:text-left">
          <p className="text-white/50 text-sm md:justify-self-start">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
          <div className="flex items-center justify-center gap-5 text-xs sm:text-sm tracking-wide">
            <a
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 text-white/60 transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black"
              href="https://www.instagram.com/vayiavs/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 text-white/60 transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black"
              href="#"
              aria-label="Pinterest"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 21c1.2-2.4 1.6-4.2 2.1-6.3" />
                <path d="M10.8 14.4c-.7 2.5-1.2 4.1-2.1 5.6" />
                <path d="M12 3a8 8 0 0 0-2.4 15.6" />
                <path d="M12 3a8 8 0 0 1 2.2 15.7" />
                <path d="M10.7 13.1c-1-.7-1.5-1.7-1.5-3a3.2 3.2 0 0 1 3.4-3.2c2.1 0 3.5 1.3 3.5 3.2 0 2.2-1.2 4-2.9 4-.8 0-1.4-.5-1.4-1.2 0-.4.8-2.8.8-3.4 0-.7-.4-1.1-1-1.1-.8 0-1.4.9-1.4 2 0 .7.2 1.2.5 1.7z" />
              </svg>
            </a>
            <a
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 text-white/60 transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black"
              href="#"
              aria-label="Facebook"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 8h2.5V4.2A16 16 0 0 0 13 4c-3.4 0-5.2 2-5.2 5.4V12H5v4h2.8v8H12v-8h3.4l.6-4h-4V9.8c0-1.2.3-1.8 2-1.8z" />
              </svg>
            </a>
          </div>
          <Image
            src="/images/MYWATERMARK.png"
            alt="Vayia signature"
            width={160}
            height={56}
            className="h-8 w-auto justify-self-center opacity-75 sm:h-10 md:justify-self-end"
          />
        </div>
      </footer>

      {/* ================= FLOATING ACTION BUTTONS ================= */}
      {scrolled && (
        <button
          onClick={() => scrollTo("hero")}
          className="fixed bottom-8 right-8 z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa]"
          title="Back to top"
        >
          ↑
        </button>
      )}
      {!isAtPageBottom && (
        <button
          onClick={() => scrollTo("contact")}
          className="fixed bottom-8 left-8 z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa]"
          title="Go to contact"
        >
          ↓
        </button>
      )}

      {/* ================= LIGHTBOX ================= */}
      {lightbox.open && (
        <div
          className={`lightbox-overlay fixed inset-0 z-[100] bg-black/90 p-6 overflow-y-auto ${
            isLightboxClosing ? "lightbox-overlay-out" : ""
          }`}
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-panel sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 bg-black/80 px-2 py-2 backdrop-blur">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/40">
                {String(lightbox.index + 1).padStart(2, "0")} /{" "}
                {String(lightbox.images.length).padStart(2, "0")}
                {lightbox.images.length > 1 ? " / Arrows" : ""} / Esc
              </p>
              <button
                type="button"
                className="rounded border border-[#d7b46a]/70 bg-[#d7b46a]/15 px-3 py-1 text-xs sm:text-sm font-medium text-[#f6dfaa] transition hover:bg-[#d7b46a] hover:text-black"
                onClick={closeLightbox}
              >
                ✕
              </button>
            </div>
            <div className="relative flex items-center justify-center pt-10">
              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-3 sm:px-4 py-2 sm:py-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] touch-manipulation"
                    onClick={() => moveLightbox("prev")}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-3 sm:px-4 py-2 sm:py-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] touch-manipulation"
                    onClick={() => moveLightbox("next")}
                  >
                    →
                  </button>
                </>
              )}
              <div
                key={`${lightbox.images[lightbox.index]}-${slideDirection}`}
                className={`lightbox-image lightbox-image-${slideDirection} relative h-[70vh] w-[90vw]`}
              >
                <Image
                  src={toSrc(lightbox.images[lightbox.index])}
                  alt=""
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
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
