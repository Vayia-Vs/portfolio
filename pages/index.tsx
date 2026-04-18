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
  const [contactState, setContactState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
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
      contactSending: "Sending...",
      contactSuccess: "Your message has been sent.",
      contactError: "Something went wrong. Please try again.",
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
      contactSending: "Αποστολή...",
      contactSuccess: "Το μήνυμά σου στάλθηκε.",
      contactError: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
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

  const handleContactSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setContactState("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      botField: String(formData.get("bot-field") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setContactState("success");
    } catch {
      setContactState("error");
    }
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
  const isMobileLayout = viewMode !== "desktop";
  const galleryContainerClass = isDesktopGallery
    ? "mx-auto w-full max-w-[1600px] px-2 sm:px-0 relative z-10"
    : "mx-auto w-full max-w-6xl px-1 sm:px-0 relative z-10";
  const galleryGridClass = isDesktopGallery
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 justify-items-stretch"
    : "grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-10 justify-items-center";
  const galleryImageSizes = isDesktopGallery
    ? "(min-width: 1280px) 18vw, (min-width: 1024px) 20vw, 33vw"
    : "(min-width: 1024px) 33vw, (min-width: 420px) 50vw, 100vw";

  return (
    <div className="bg-black text-white">
      {/* ================= SPLASH SCREEN ================= */}
      {!hasChosenView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-amber-500/20 bg-gray-900/90 px-5 py-8 text-center backdrop-blur sm:space-y-12 sm:px-6 sm:py-12">
            <div>
              <h2 className="mb-4 font-serif text-3xl md:text-5xl">Welcome</h2>
              <p className="text-base text-white/60 sm:text-lg">Choose your preferred view:</p>
            </div>

            {/* View Mode Selection */}
            <div className="mt-8 flex flex-col justify-center gap-4 sm:mt-0 sm:flex-row sm:gap-6">
              <button
                onClick={() => {
                  setViewMode("mobile");
                  localStorage.setItem("viewMode", "mobile");
                  localStorage.setItem("hasChosenView", "true");
                  setHasChosenView(true);
                }}
                className="group w-full rounded-xl border-2 border-amber-500/30 px-6 py-5 transition hover:border-amber-500/60 hover:bg-amber-500/10 sm:px-8 sm:py-6"
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
                className="group w-full rounded-xl border-2 border-amber-500/30 px-6 py-5 transition hover:border-amber-500/60 hover:bg-amber-500/10 sm:px-8 sm:py-6"
              >
                <div className="text-5xl">🖥️</div>
                <div className="text-white font-medium">Desktop View</div>
                <div className="text-sm text-white/50">Large images & layout</div>
              </button>
            </div>

            <p className="mt-6 text-xs text-white/40 sm:mt-0">You can change this anytime in the header.</p>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/85 backdrop-blur border-b border-[#d7b46a]/25 py-3 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-[#d7b46a]/80 after:shadow-[0_0_18px_rgba(215,180,106,0.45)] sm:py-4 sm:after:left-6 sm:after:right-6"
            : "bg-transparent py-3 sm:py-6"
        }`}
      >
        <nav className="px-4 sm:px-6">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
            <p className="justify-self-start text-[11px] font-light uppercase tracking-[0.24em] text-white/85 sm:text-base sm:tracking-[0.34em] lg:text-lg">
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

            <div className="flex items-center justify-self-end gap-2 sm:gap-4">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1 text-[10px] uppercase tracking-[0.18em] sm:gap-2 sm:text-xs sm:tracking-widest">
                <button
                  onClick={() => {
                    setViewMode("mobile");
                    localStorage.setItem("viewMode", "mobile");
                  }}
                  title="Mobile view"
                  className={`rounded-full px-2 py-1 transition sm:px-3 ${
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
                  className={`rounded-full px-2 py-1 transition sm:px-3 ${
                    viewMode === "desktop"
                      ? "border-[#d7b46a] bg-[#d7b46a]/20 text-[#f6dfaa]"
                      : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                  }`}
                >
                  🖥️
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1 text-[11px] uppercase tracking-[0.18em] sm:gap-2 sm:text-sm sm:tracking-widest">
                <button
                  onClick={() => {
                    setLang("en");
                    localStorage.setItem("lang", "en");
                  }}
                  className={`rounded-full px-2 py-1 transition sm:px-3 ${
                    lang === "en"
                      ? "border-[#d7b46a] bg-[#d7b46a]/15 text-[#f6dfaa]"
                      : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLang("gr");
                    localStorage.setItem("lang", "gr");
                  }}
                  className={`rounded-full px-2 py-1 transition sm:px-3 ${
                    lang === "gr"
                      ? "border-[#d7b46a] bg-[#d7b46a]/15 text-[#f6dfaa]"
                      : "border-transparent text-white/40 hover:border-[#d7b46a]/70 hover:bg-[#d7b46a]/10 hover:text-[#f6dfaa]"
                  }`}
                >
                  GR
                </button>
              </div>
            </div>
          </div>

          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {T[lang].nav.map((item) => (
              <li key={item.target}>
                <button
                  onClick={() => scrollTo(item.target)}
                  className="whitespace-nowrap rounded-full border border-[#d7b46a]/30 bg-black/35 px-3 py-2 text-[10px] tracking-[0.24em] uppercase text-white/80 transition hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa]"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('/images/hero.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/16 to-black/58" />
        </div>

        <div className="relative z-10 max-w-4xl px-5 pb-14 pt-28 text-center sm:px-6 sm:pb-16 sm:pt-32">
          <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-white/60 sm:mb-6 sm:text-xs sm:tracking-[0.3em]">
            {T[lang].heroTag}
          </p>

          <h1 className="mb-8 font-serif text-[2.6rem] leading-[0.96] sm:mb-10 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
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
            className={`mx-auto mb-10 text-sm leading-7 text-white/72 sm:mb-12 sm:text-lg sm:leading-relaxed md:text-lg ${
              lang === "en"
                ? "max-w-xl sm:max-w-2xl lg:max-w-5xl lg:whitespace-nowrap"
                : "max-w-xl"
            }`}
          >
            {T[lang].heroText}
          </p>

          <button
            onClick={() => scrollTo("gallery")}
            className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-black/25 px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-white transition hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa] sm:border-b sm:border-x-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-2 sm:text-sm sm:tracking-widest"
          >
            {T[lang].viewGallery} ↓
          </button>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section
        id="gallery"
        className="gallery-backdrop relative overflow-hidden border-t border-white/10 px-4 py-16 sm:px-8 sm:py-20 md:px-20 md:py-32"
      >
        <div className={galleryContainerClass}>
          <h2 className="mb-8 font-serif text-3xl text-white sm:mb-10 sm:text-4xl md:mb-20 md:text-5xl">
            {T[lang].galleryTitle}
          </h2>

          <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-white/70 sm:mb-10 sm:flex-wrap sm:gap-3 sm:text-xs sm:tracking-[0.3em]">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-3 py-2 font-normal uppercase tracking-[0.22em] transition sm:rounded sm:px-4 sm:tracking-[0.3em] ${
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
                ? "h-[25rem] min-[420px]:h-56 md:h-72 lg:h-96"
                : viewMode === "desktop"
                ? "h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96"
                : "h-[25rem] min-[420px]:h-56 md:h-72 lg:h-96"; // auto defaults to mobile
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
                  <div className={`${heightClass} relative w-full overflow-hidden rounded-[1.25rem] border border-transparent bg-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.34)] transition-all duration-300 group hover:scale-[1.02] hover:border-[#d7b46a] hover:ring-2 hover:ring-[#f6dfaa]/70 hover:shadow-[0_18px_55px_rgba(0,0,0,0.34),0_0_28px_rgba(215,180,106,0.3)] sm:rounded-lg sm:hover:scale-105`}>
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
                className="rounded-full border border-[#d7b46a] bg-[#d7b46a] px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)] sm:rounded sm:px-8 sm:text-sm sm:tracking-widest"
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
        className="border-t border-white/10 px-4 py-16 sm:px-8 md:px-16 md:py-24 xl:px-20 xl:py-28"
      >
        <div className="ml-0 mr-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-20">
          <div className="max-w-[44rem]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-white/50 sm:mb-5 sm:tracking-[0.45em]">
              {T[lang].aboutKicker}
            </p>
            <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl xl:text-5xl">
              {T[lang].aboutTitle1}{" "}
              <span className="italic">{T[lang].aboutTitle2}</span>
            </h2>

            <div className="max-w-[38rem] space-y-4 text-sm leading-7 text-white/70 sm:space-y-5 sm:text-base sm:leading-8 xl:space-y-6">
              {T[lang].aboutText.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[10px] tracking-[0.35em] text-[#d7b46a] uppercase">
              <span>Street Photography</span>
              <span>Portrait</span>
              <span>Architecture</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none lg:border-l lg:border-white/10 lg:pl-8 lg:pt-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] bg-white/10">
              <Image
                src="/images/vayia.JPEG"
                alt="Vayia portrait"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= COLLABORATION ================= */}
      <section className="relative overflow-hidden border-t border-white/10 bg-black px-4 py-16 sm:px-8 sm:py-20 md:px-20 md:py-32">
        <Image
          src="/images/greece1-landsc.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/46 to-black/20" />
        <div className="absolute inset-0 bg-white/8" />
        <div className="relative z-10 ml-auto mr-0 max-w-5xl">
          <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/50 sm:mb-6 sm:text-xs sm:tracking-[0.4em]">
            {T[lang].servicesKicker}
          </p>
          {T[lang].servicesTitle && (
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-12">
              {T[lang].servicesTitle}
            </h2>
          )}

          <div className="grid items-start gap-8">
            <div className="mb-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              {T[lang].services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-[1.25rem] border border-[#d7b46a]/45 bg-black/52 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm transition hover:border-[#f6dfaa] hover:bg-black/68 hover:shadow-[0_0_24px_rgba(215,180,106,0.16)] sm:rounded-lg sm:p-8"
                >
                  <div className="mb-7 text-[#d7b46a]">
                    <ServiceIcon name={service.icon} />
                  </div>
                  <h3 className="mb-3 font-serif text-[1.7rem] sm:text-2xl">{service.title}</h3>
                  <p className="mb-4 text-sm leading-7 text-white/60">{service.text}</p>
                  <a href="#contact" className="text-sm uppercase tracking-[0.24em] text-[#d7b46a] transition hover:text-[#f6dfaa] sm:tracking-widest">
                    {T[lang].inquire} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

            {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="border-t border-white/10 px-4 py-16 sm:px-8 sm:py-20 md:px-20 md:py-32"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-white/60 sm:mb-6 sm:text-xs sm:tracking-[0.5em]">
            {T[lang].contactKicker}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
            {T[lang].contactTitle1}{" "}
            <span className="italic">{T[lang].contactTitle2}</span>
          </h2>
          <p className="mb-8 text-sm leading-7 text-white/60 sm:mb-12 sm:text-base md:text-lg md:leading-relaxed">
            {T[lang].contactText}
          </p>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-8 text-left sm:space-y-10"
          >
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
                  type="text"
                  name="name"
                  placeholder={T[lang].formNamePlaceholder}
                  className="w-full border-b border-white/30 bg-transparent py-3 text-white/80 placeholder:text-white/35 transition focus:border-[#d7b46a]/80 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-xs tracking-[0.42em] uppercase text-white/70 mb-4">
                  {T[lang].formEmail}
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder={T[lang].formEmailPlaceholder}
                  className="w-full border-b border-white/30 bg-transparent py-3 text-white/80 placeholder:text-white/35 transition focus:border-[#d7b46a]/80 focus:outline-none"
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
                className="w-full border-b border-white/30 bg-transparent py-3 text-white/80 placeholder:text-white/35 transition focus:border-[#d7b46a]/80 focus:outline-none"
              />
            </label>

            {contactState !== "idle" && (
              <p
                className={`text-sm ${
                  contactState === "success"
                    ? "text-[#d7b46a]"
                    : contactState === "error"
                      ? "text-red-300"
                      : "text-white/60"
                }`}
              >
                {contactState === "success"
                  ? T[lang].contactSuccess
                  : contactState === "error"
                    ? T[lang].contactError
                    : T[lang].contactSending}
              </p>
            )}

            <div className="pt-6 text-center sm:pt-8">
              <button
                type="submit"
                disabled={contactState === "submitting"}
                className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black hover:shadow-[0_0_28px_rgba(215,180,106,0.3)] disabled:cursor-not-allowed disabled:opacity-70 sm:gap-3 sm:px-12 sm:py-4 sm:text-xs sm:tracking-[0.4em]"
              >
                {contactState === "submitting"
                  ? T[lang].contactSending
                  : T[lang].contactCTA}
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
      <footer className="border-t border-white/10 bg-[#111716] px-4 py-6 sm:px-8 md:px-20">
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
          className={`fixed z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] ${
            isMobileLayout ? "bottom-24 right-4" : "bottom-8 right-8"
          }`}
          title="Back to top"
        >
          ↑
        </button>
      )}
      {!isAtPageBottom && (
        <button
          onClick={() => scrollTo("contact")}
          className={`fixed z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] ${
            isMobileLayout ? "bottom-8 right-4" : "bottom-8 left-8"
          }`}
          title="Go to contact"
        >
          ↓
        </button>
      )}

      {/* ================= LIGHTBOX ================= */}
      {lightbox.open && (
        <div
          className={`lightbox-overlay fixed inset-0 z-[100] overflow-y-auto bg-black/90 p-3 sm:p-6 ${
            isLightboxClosing ? "lightbox-overlay-out" : ""
          }`}
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-panel sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-black/80 px-2 py-2 backdrop-blur sm:gap-4">
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
            <div className="relative flex items-center justify-center pt-6 sm:pt-10">
              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-3 py-2 text-xs uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] touch-manipulation sm:left-3 sm:px-4 sm:py-3 sm:tracking-[0.3em]"
                    onClick={() => moveLightbox("prev")}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-3 py-2 text-xs uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] touch-manipulation sm:right-3 sm:px-4 sm:py-3 sm:tracking-[0.3em]"
                    onClick={() => moveLightbox("next")}
                  >
                    →
                  </button>
                </>
              )}
              <div
                key={`${lightbox.images[lightbox.index]}-${slideDirection}`}
                className={`lightbox-image lightbox-image-${slideDirection} relative h-[72vh] w-[92vw] sm:h-[70vh] sm:w-[90vw]`}
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
