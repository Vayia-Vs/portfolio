import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import path from "path";
import fs from "fs";
import {
  curatedImageOrder,
  homeContent,
  siteUrl,
} from "@/content/homeContent";
import { projectsContent } from "@/content/projectsContent";
import { trackEvent } from "@/lib/analytics";

type HomeProps = {
  imagesFromFs: string[];
};

export default function Home({ imagesFromFs }: HomeProps) {
  /* ================= STATE ================= */
  const [scrolled, setScrolled] = useState(false);
  const [isAtPageBottom, setIsAtPageBottom] = useState(false);
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [lang, setLang] = useState<"en" | "gr">("en");
  const [viewMode, setViewMode] = useState<"auto" | "mobile" | "desktop">("auto");
  const [hasChosenView, setHasChosenView] = useState(true);
  const [contactState, setContactState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [contactErrorMessage, setContactErrorMessage] = useState("");
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    images: string[];
    index: number;
  }>({ open: false, images: [], index: 0 });
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "none">("none");
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [contactStartedAt, setContactStartedAt] = useState(() => Date.now());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const framesSectionRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-section='true']"),
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* ================= TEXTS ================= */
  const T = homeContent;

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const pageBottom =
        document.documentElement.scrollHeight - (scrollY + window.innerHeight);
      const heroHeight = document.getElementById("hero")?.offsetHeight ?? window.innerHeight;

      setScrolled(scrollY > 50);
      setIsAtPageBottom(pageBottom < 80);
      setHasPassedHero(scrollY > Math.max(heroHeight - 140, 220));
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

  useEffect(() => {
    if (!lightbox.open || lightbox.images.length < 2) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("hasSeenSwipeHint") === "true") return;

    setShowSwipeHint(true);
    window.localStorage.setItem("hasSeenSwipeHint", "true");

    const timer = window.setTimeout(() => setShowSwipeHint(false), 2400);
    return () => window.clearTimeout(timer);
  }, [lightbox.images.length, lightbox.open]);

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

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) return;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) < 45) return;
    moveLightbox(deltaX < 0 ? "next" : "prev");
  };

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

  const scrollTo = useCallback(
    (id: string) => {
      const target = id === "gallery" ? framesSectionRef.current : document.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  const handleContactSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setContactState("submitting");
    setContactErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      inquiryType: String(formData.get("inquiryType") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      botField: String(formData.get("bot-field") ?? "").trim(),
      submittedAt: Number(formData.get("submitted-at") ?? contactStartedAt),
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
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(result?.error || "Request failed");
      }

      form.reset();
      setContactStartedAt(Date.now());
      const textarea = messageTextareaRef.current;
      if (textarea) {
        textarea.style.height = "";
      }
      trackEvent("contact_submit", {
        inquiry_type: payload.inquiryType || "unspecified",
        company: payload.company || "unspecified",
      });
      setContactState("success");
    } catch (error) {
      if (error instanceof Error) {
        setContactErrorMessage(error.message);
      }
      setContactState("error");
    }
  };

  const handleMessageInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
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
  const isGreek = lang === "gr";
  const seoTitle = isGreek
    ? "Βάγια Βασιλείου | Φωτογραφία δρόμου, πορτρέτα και οπτικές ιστορίες"
    : "Vayia Vasileiou | Street, portrait, and atmospheric photography";
  const seoDescription = isGreek
    ? "Portfolio φωτογραφίας με εικόνες δρόμου, πορτρέτα, αρχιτεκτονική και ατμοσφαιρικές λήψεις από την Αθήνα και όχι μόνο."
    : "Photography portfolio featuring street, portrait, architecture, and atmospheric imagery from Athens and beyond.";
  const seoLocale = isGreek ? "el_GR" : "en_US";
  const seoImage = `${siteUrl}/og-card.svg`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Vayia Vasileiou Portfolio",
      url: siteUrl,
      inLanguage: isGreek ? "el-GR" : "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Vayia Vasileiou",
      url: siteUrl,
      image: `${siteUrl}/images/vayia.JPEG`,
      jobTitle: isGreek ? "Φωτογράφος" : "Photographer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Athens",
        addressCountry: "GR",
      },
      email: "mailto:vayiavs95@gmail.com",
      sameAs: ["https://www.instagram.com/vayiavs/"],
    },
  ];

  useEffect(() => {
    if (!lightbox.open || typeof window === "undefined" || lightbox.images.length < 2) return;

    const preloadIndexes = [
      (lightbox.index + 1) % lightbox.images.length,
      (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
    ];

    preloadIndexes.forEach((imageIndex) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = toSrc(lightbox.images[imageIndex]);
    });
  }, [lightbox.images, lightbox.index, lightbox.open]);

  const formatGreekCaps = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const formatUiLabel = useCallback(
    (value: string) => (isGreek ? formatGreekCaps(value) : value),
    [isGreek],
  );

  const parseTags = (name: string) => {
    const filename = name.split("/").pop() ?? "";
    const base = filename.replace(/\.[^/.]+$/, "");
    const parts = base.split("-");
    const tagParts = parts.slice(1);
    return tagParts.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  };

  const getPrimaryTagLabel = (name: string) => {
    const primaryTag = parseTags(name)[0];

    if (!primaryTag) return isGreek ? "ΣΥΛΛΟΓΗ" : "COLLECTION";
    if (primaryTag === "archit") return isGreek ? "ΑΡΧΙΤΕΚΤΟΝΙΚΗ" : "ARCHITECTURE";
    if (primaryTag === "landsc") return isGreek ? "ΤΟΠΙΑ" : "LANDSCAPE";
    if (primaryTag === "int") return isGreek ? "ΕΣΩΤΕΡΙΚΟΙ ΧΩΡΟΙ" : "INTERIOR";
    if (primaryTag === "street") return isGreek ? "ΦΩΤΟΓΡΑΦΙΑ ΔΡΟΜΟΥ" : "STREET";
    return formatUiLabel(primaryTag);
  };

  const getImageAlt = (name: string) => {
    const label = getPrimaryTagLabel(name).toLowerCase();
    return isGreek ? `Φωτογραφια ${label}` : `${label} photograph`;
  };

  const isDesktopGallery = viewMode === "desktop";
  const isMobileLayout = viewMode !== "desktop";
  const previewImages = images.slice(0, isMobileLayout ? 8 : 10);
  const galleryImages = previewImages;
  const selectedProjects = projectsContent;
  const looseGalleryImageSizes = isDesktopGallery
    ? "(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, 45vw"
    : "(min-width: 768px) 46vw, 92vw";

  return (
    <div className={`bg-black text-white ${isGreek ? "font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]" : ""}`}>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050505" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vayia Vasileiou Portfolio" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:locale" content={seoLocale} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content="Vayia Vasileiou photography portfolio" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      {/* ================= SPLASH SCREEN ================= */}
      {!hasChosenView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-amber-500/20 bg-gray-900/90 px-5 py-8 text-center backdrop-blur sm:space-y-12 sm:px-6 sm:py-12">
            <div>
              <h2 className={`mb-4 text-3xl md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>Welcome</h2>
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
            ? "bg-black/88 backdrop-blur border-b border-[#d7b46a]/25 py-1.5 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-[#d7b46a]/80 after:shadow-[0_0_18px_rgba(215,180,106,0.45)] sm:py-2 sm:after:left-6 sm:after:right-6"
            : "bg-transparent py-3 sm:py-6"
        }`}
      >
        <a
          href="#gallery"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#d7b46a] focus:px-4 focus:py-2 focus:text-black"
        >
          {isGreek ? "Μεταβαση στη συλλογη" : "Skip to gallery"}
        </a>
        <nav className="px-4 sm:px-6" aria-label={isGreek ? "Κυρια πλοηγηση" : "Primary navigation"}>
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
            <p className={`justify-self-start font-light uppercase text-white/85 transition-all ${scrolled ? "text-[10px] tracking-[0.2em] sm:text-base sm:tracking-[0.34em]" : "text-[11px] tracking-[0.24em] sm:text-base sm:tracking-[0.34em]"} lg:text-lg`}>
              Vayia Vasileiou
            </p>

            <ul className="hidden items-center justify-self-center md:flex md:gap-4 lg:gap-8">
              {T[lang].nav.map((item) => (
                <li key={item.target}>
                  <button
                    onClick={() => scrollTo(item.target)}
                    className={`px-3 py-2 text-xs uppercase transition lg:text-sm ${
                      scrolled
                        ? "font-semibold tracking-[0.18em] text-[#d7b46a]"
                        : "rounded border border-transparent tracking-[0.22em] text-white/70 hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa]"
                    }`}
                  >
                    {formatUiLabel(item.label)}
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
                  aria-label={isGreek ? "Mobile προβολη" : "Switch to mobile view"}
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
                  aria-label={isGreek ? "Desktop προβολη" : "Switch to desktop view"}
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
                  aria-label="Switch language to English"
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
                  aria-label="Αλλαγη γλωσσας σε Ελληνικα"
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

          <ul className={`flex justify-center gap-1.5 overflow-x-auto pb-1 md:hidden ${scrolled ? "mt-1" : "mt-3"}`}>
            {T[lang].nav.map((item) => (
              <li key={item.target}>
                <button
                  onClick={() => scrollTo(item.target)}
                  className={`min-h-9 whitespace-nowrap px-2.5 py-1.5 text-[8.5px] uppercase transition ${
                    scrolled
                      ? "font-semibold tracking-[0.14em] text-[#d7b46a]"
                      : "rounded-full border border-[#d7b46a]/30 bg-black/35 px-3 py-2 tracking-[0.16em] text-white/80 hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa]"
                  }`}
                >
                  {formatUiLabel(item.label)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="relative flex min-h-[110svh] items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            quality={74}
            sizes="100vw"
            className="object-cover object-[58%_center] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/16 to-black/58" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-18 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-36">
          <h1 className={`mb-6 text-center text-[clamp(1.58rem,7.2vw,5.35rem)] leading-[0.98] whitespace-nowrap sm:mb-8 ${isGreek ? "font-sans italic font-medium" : "font-serif italic"}`}>
            {lang === "gr" ? (
              <>
                {T[lang].heroTitle1} {T[lang].heroTitle2}{" "}
                {T[lang].heroTitle3}
              </>
            ) : (
              <>
                {T[lang].heroTitle1} {T[lang].heroTitle2}{" "}
                {T[lang].heroTitle3}
              </>
            )}
          </h1>

          <p
            className={`mx-auto mb-11 text-sm leading-7 text-white/72 sm:mb-12 sm:text-lg sm:leading-relaxed md:text-lg ${
              lang === "en"
                ? "max-w-xl sm:max-w-2xl lg:max-w-3xl"
                : "max-w-xl lg:max-w-3xl"
            }`}
          >
            {T[lang].heroText}
          </p>

          <div className="mt-5 flex flex-row items-center justify-center gap-2 sm:mt-7 sm:gap-4">
            <button
              onClick={() => {
                trackEvent("cta_click", { cta: "view_gallery", location: "hero" });
                scrollTo("gallery");
              }}
              className="inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-4 py-2.5 text-[9px] uppercase tracking-[0.18em] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)] sm:min-h-[2.85rem] sm:min-w-[11.5rem] sm:px-5 sm:text-xs sm:tracking-[0.3em]"
            >
              {formatUiLabel(T[lang].viewGallery)} ↓
            </button>
            <button
              onClick={() => {
                trackEvent("cta_click", { cta: "contact", location: "hero" });
                scrollTo("contact");
              }}
              className="inline-flex min-h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2.5 text-[9px] uppercase tracking-[0.18em] text-white transition hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa] sm:min-h-[2.85rem] sm:min-w-[11.5rem] sm:px-5 sm:text-xs sm:tracking-[0.3em]"
            >
              {formatUiLabel(T[lang].contactButton)}
            </button>
          </div>
        </div>
      </section>

      {/* ================= PROJECTS ================= */}
      <section
        id="projects"
        data-reveal-section="true"
        className="reveal-section border-t border-white/10 px-4 py-16 sm:px-8 md:px-20 md:py-24"
      >
        <div className="mx-auto max-w-[92rem]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className={`mb-4 uppercase tracking-[0.34em] ${isGreek ? "text-[11px] font-medium text-white/72" : "text-[10px] text-white/45"}`}>
                {isGreek ? "Selected projects" : "Selected projects"}
              </p>
              <h2 className={`text-3xl italic sm:text-4xl md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
                {isGreek ? "Ιστορίες μέσα από καρέ" : "Stories in Frames"}
              </h2>
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-4 hide-scrollbar sm:-mx-2 sm:px-2">
            <div className="flex min-w-max gap-4 pr-[18vw] sm:gap-5 sm:pr-16 lg:pr-24">
            {selectedProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group w-[78vw] max-w-[24rem] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-[#d7b46a]/70 sm:w-[21rem] lg:w-[24rem]"
                onClick={() => trackEvent("project_open", { project_slug: project.slug, source: "home" })}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={`/images/${encodeURIComponent(project.cover)}`}
                    alt={isGreek ? project.gr.title : project.en.title}
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 92vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    quality={72}
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-2xl italic ${isGreek ? "font-sans" : "font-serif"}`}>
                      {isGreek ? project.gr.title : project.en.title}
                    </h3>
                    <span className={`uppercase tracking-[0.24em] ${isGreek ? "text-[12px] font-medium text-white/62" : "text-[11px] text-white/38"}`}>
                      {project.year}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-white/60">
                    {isGreek ? project.gr.summary : project.en.summary}
                  </p>
                </div>
              </Link>
            ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/projects"
              className={`inline-flex rounded-full border border-white/12 px-4 py-2 transition hover:border-[#d7b46a] hover:text-[#f6dfaa] ${isGreek ? "text-[15px] font-medium text-white/82" : "text-sm text-white/70"}`}
            >
              {isGreek ? "Ολες οι σελιδες" : "All projects"}
            </Link>
          </div>
        </div>
      </section>

      {/* ================= LOOSE FRAMES ================= */}
      <section
        id="gallery"
        ref={framesSectionRef}
        data-reveal-section="true"
        className="reveal-section gallery-backdrop relative overflow-hidden border-t border-white/10 px-4 py-12 sm:px-8 sm:py-16 md:px-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10 md:mb-14">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-white/45">
                {isGreek ? "Selected frames" : "Selected frames"}
              </p>
              <h2 className={`text-3xl italic text-white sm:text-4xl md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
                {T[lang].galleryTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-5">
            {galleryImages.map((name, index) => {
              return (
                <button
                  key={name}
                  type="button"
                  className="animate-gallery-item group w-full text-left"
                  style={{ animationDelay: `${Math.min(index, 14) * 70}ms` }}
                  onClick={() => {
                    trackEvent("gallery_open", {
                      source: "loose_frames",
                      image: name,
                    });
                    const lightboxIndex = images.findIndex((imageName) => imageName === name);
                    openLightbox(images, lightboxIndex >= 0 ? lightboxIndex : index);
                  }}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/[0.04] shadow-[0_18px_46px_rgba(0,0,0,0.22)] transition duration-500 group-hover:-translate-y-1 group-hover:border-[#d7b46a]/60">
                    <Image
                      src={toSrc(name)}
                      alt={getImageAlt(name)}
                      fill
                      sizes={looseGalleryImageSizes}
                      className="object-cover transition duration-700 group-hover:scale-[1.02]"
                      priority={index < 4}
                      quality={index < 4 ? 74 : 68}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {images.length > previewImages.length && (
            <div className="mt-10 flex justify-center sm:mt-12">
              <Link
                href="/gallery"
                className="rounded-full border border-[#d7b46a] bg-[#d7b46a] px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)] sm:px-8 sm:text-sm sm:tracking-widest"
              >
                {T[lang].showMore} ↓
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        data-reveal-section="true"
        className="reveal-section border-t border-white/10 px-4 py-16 sm:px-8 md:px-16 md:py-24 xl:px-20 xl:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-20">
          <div className="order-2 mx-auto w-full max-w-[320px] lg:order-1 lg:mx-0 lg:max-w-none lg:pr-8 lg:pt-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
              <Image
                src="/images/vayia.JPEG"
                alt="Vayia portrait"
                fill
                sizes="(min-width: 1024px) 34vw, 90vw"
                className="object-cover"
                quality={74}
              />
            </div>
          </div>

          <div className="order-1 max-w-[44rem] lg:order-2 lg:pt-6">
            <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-white/50 sm:mb-5 sm:tracking-[0.45em]">
              {formatUiLabel(T[lang].aboutKicker)}
            </p>
            <h2 className={`mb-6 text-3xl italic leading-tight sm:text-4xl xl:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
              {T[lang].aboutTitle1}{" "}
              <span>{T[lang].aboutTitle2}</span>
            </h2>

            <div className="max-w-[38rem] space-y-4 text-sm leading-7 text-white/70 sm:space-y-5 sm:text-base sm:leading-8 xl:space-y-6">
              {T[lang].aboutText.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-9 hidden flex-wrap gap-x-5 gap-y-2 text-[10px] tracking-[0.35em] text-[#d7b46a] uppercase lg:flex">
              {isGreek ? (
                <>
                  <span>Φωτογραφία δρόμου</span>
                  <span>Πορτραίτα</span>
                  <span>Αρχιτεκτονική</span>
                  <span>Τοπία</span>
                </>
              ) : (
                <>
                  <span>Street Photography</span>
                  <span>Portrait</span>
                  <span>Architecture</span>
                  <span>Landscapes</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= COLLABORATION ================= */}
      <section
        data-reveal-section="true"
        className="reveal-section relative flex min-h-[96svh] items-center overflow-hidden border-t border-white/10 bg-black px-4 py-16 sm:px-8 sm:py-18 md:px-20 md:py-20"
      >
        <Image
          src="/images/greece1-landsc.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          quality={70}
        />
        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/46 to-black/20" />
        <div className="absolute inset-0 bg-white/8" />
        <div className="relative z-10 mx-auto max-w-[92rem]">
          <div className="max-w-sm lg:mb-10">
            {T[lang].servicesKicker ? (
              <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/50 sm:mb-6 sm:text-xs sm:tracking-[0.4em]">
                {formatUiLabel(T[lang].servicesKicker)}
              </p>
            ) : null}
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-8">
              {T[lang].services.map((service, index) => (
                <div
                  key={service.title}
                  className="animate-gallery-item rounded-[1.15rem] border border-[#d7b46a]/38 bg-black/52 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:border-[#f6dfaa] hover:bg-black/66 hover:shadow-[0_0_18px_rgba(215,180,106,0.14)] sm:rounded-lg sm:p-6 lg:flex lg:min-h-[24rem] lg:flex-col lg:justify-between lg:p-8"
                  style={{ animationDelay: `${260 + index * 140}ms` }}
                >
                  <h3 className={`mb-3 text-[1.35rem] leading-tight sm:text-[1.55rem] lg:text-[1.75rem] ${isGreek ? "font-sans" : "font-serif"}`}>{service.title}</h3>
                  <p className="mb-8 text-sm leading-7 text-white/60 lg:mb-10 lg:text-[0.98rem]">{service.text}</p>
                  <a
                    href="#contact"
                    onClick={() => trackEvent("cta_click", { cta: "service_inquire", service: service.title })}
                    className="mt-auto text-sm uppercase tracking-[0.24em] text-[#d7b46a] transition hover:text-[#f6dfaa] sm:tracking-widest"
                  >
                    {T[lang].inquire} →
                  </a>
                </div>
              ))}
          </div>
        </div>
      </section>

            {/* ================= CONTACT ================= */}
      <section
        id="contact"
        data-reveal-section="true"
        className="reveal-section flex min-h-[100svh] items-center border-t border-white/10 px-4 py-16 sm:px-8 sm:py-20 md:px-20 md:py-32"
      >
        <div className="mx-auto max-w-5xl text-center">
          <div>
            {T[lang].contactKicker ? (
              <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-white/60 sm:mb-6 sm:text-xs sm:tracking-[0.5em]">
                {formatUiLabel(T[lang].contactKicker)}
              </p>
            ) : null}
            <h2 className={`mb-4 text-3xl italic sm:mb-6 sm:text-4xl md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
              {T[lang].contactTitle1}{" "}
              <span>{T[lang].contactTitle2}</span>
            </h2>
            <p className="mx-auto mb-5 max-w-3xl text-sm leading-7 text-white/60 sm:mb-12 sm:text-base md:text-lg md:leading-relaxed">
              {T[lang].contactText}
            </p>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="mx-auto max-w-3xl space-y-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6 text-left shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:space-y-10 sm:px-8 sm:py-8"
          >
            <div className="hidden">
              <label>
                Don&apos;t fill this out if you&apos;re human:
                <input name="bot-field" />
              </label>
              <input name="submitted-at" value={contactStartedAt} readOnly />
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <label className="block">
                <span className="block text-xs tracking-[0.42em] uppercase text-white/70 mb-4">
                  {formatUiLabel(T[lang].formName)}
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
                  {formatUiLabel(T[lang].formEmail)}
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
              <span className="mb-4 block text-xs tracking-[0.42em] uppercase text-white/70">
                {formatUiLabel(T[lang].formMessage)}
              </span>
              <div className="relative rounded-[1.45rem] border border-white/15 bg-white/[0.04] px-4 py-2.5 pr-14 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
                <textarea
                  ref={messageTextareaRef}
                  required
                  name="message"
                  rows={1}
                  placeholder={T[lang].formMessagePlaceholder}
                  onInput={handleMessageInput}
                  className="min-h-8 w-full resize-none bg-transparent py-1 text-[0.88rem] text-white/80 placeholder:text-[0.78rem] placeholder:text-white/35 transition focus:outline-none sm:text-base sm:placeholder:text-sm"
                />
                <button
                  type="submit"
                  disabled={contactState === "submitting"}
                  aria-label={contactState === "submitting" ? T[lang].contactSending : T[lang].contactCTA}
                  className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7b46a] bg-[#d7b46a] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_20px_rgba(215,180,106,0.26)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {contactState === "submitting" ? (
                      <path d="M5 12h14" />
                    ) : (
                      <path d="M5 12h11m-5-5 5 5-5 5" />
                    )}
                  </svg>
                </button>
              </div>
            </label>

            {contactState !== "idle" && (
              <p
                aria-live="polite"
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
                    ? contactErrorMessage || T[lang].contactError
                    : T[lang].contactSending}
              </p>
            )}

          </form>
        </div>
      </section>
      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-[#111716] px-4 py-6 sm:px-8 md:px-20">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <div className="justify-self-start text-left">
            <p className="text-[11px] text-white/58 sm:text-sm">
              &copy; {new Date().getFullYear()} Vayia Vasileiou
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/30 sm:text-[11px]">
              {T[lang].footerLocation}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs tracking-wide sm:gap-5 sm:text-sm">
            <a
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 text-white/60 transition hover:border-[#d7b46a] hover:bg-[#d7b46a] hover:text-black sm:h-12 sm:w-12"
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
          </div>
          <Image
            src="/images/MYWATERMARK.png"
            alt="Vayia signature"
            width={160}
            height={56}
            className="h-6 w-auto justify-self-end opacity-70 sm:h-8"
          />
        </div>
      </footer>

      {/* ================= FLOATING ACTION BUTTONS ================= */}
      {scrolled && (
        <button
          onClick={() => scrollTo("hero")}
          className={`fixed z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] ${
            isMobileLayout ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4" : "bottom-8 right-8"
          }`}
          title="Back to top"
        >
          ↑
        </button>
      )}
      {hasPassedHero && !isAtPageBottom && (
        <button
          onClick={() => scrollTo("contact")}
          className={`fixed z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] p-3 text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] backdrop-blur transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] ${
            isMobileLayout ? "bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4" : "bottom-8 left-8"
          }`}
          title="Go to contact"
        >
          ↓
        </button>
      )}

      {/* ================= LIGHTBOX ================= */}
      {lightbox.open && (
        <div
          className={`lightbox-overlay fixed inset-0 z-[100] overflow-hidden bg-black/92 p-3 sm:p-6 ${
            isLightboxClosing ? "lightbox-overlay-out" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={isGreek ? "Προεπισκοπηση εικονας" : "Image preview"}
          onClick={closeLightbox}
        >
          <div
            className="relative flex h-full w-full flex-col justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <div className="lightbox-panel mx-auto mb-4 flex w-full max-w-4xl justify-center pt-1 text-center sm:mb-6 sm:pt-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 sm:text-xs sm:tracking-[0.34em]">
                {String(lightbox.index + 1).padStart(2, "0")} / {String(lightbox.images.length).padStart(2, "0")}
              </p>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden pt-2 sm:pt-4">
              {showSwipeHint && (
                <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/65 backdrop-blur sm:top-6">
                  Swipe to navigate
                </div>
              )}
              <div
                key={`${lightbox.images[lightbox.index]}-${slideDirection}`}
                className={`lightbox-image lightbox-image-${slideDirection} relative z-10 h-[68svh] w-[86vw] max-w-5xl sm:h-[70vh] sm:w-[84vw]`}
              >
                <Image
                  src={toSrc(lightbox.images[lightbox.index])}
                  alt={getImageAlt(lightbox.images[lightbox.index])}
                  fill
                  sizes="84vw"
                  className="object-contain"
                  priority
                  quality={78}
                />
              </div>
            </div>
            {lightbox.images.length > 1 && (
              <div className="mx-auto mt-4 hidden w-full max-w-5xl items-center justify-center gap-3 overflow-x-auto px-2 pb-1 sm:flex">
                {lightbox.images.map((imageName, index) => (
                  <button
                    key={`thumb-${imageName}`}
                    type="button"
                    onClick={() => {
                      setSlideDirection(index > lightbox.index ? "next" : "prev");
                      setLightbox((prev) => ({ ...prev, index }));
                    }}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.9rem] border transition ${
                      index === lightbox.index
                        ? "border-[#f6dfaa] opacity-100 shadow-[0_0_0_1px_rgba(246,223,170,0.35)]"
                        : "border-white/10 opacity-55 hover:border-white/40 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={toSrc(imageName)}
                      alt={getImageAlt(imageName)}
                      fill
                      sizes="64px"
                      className="object-cover"
                      quality={52}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                className="inline-flex min-h-11 items-center px-1 py-2 text-[11px] uppercase tracking-[0.28em] text-white/70 transition hover:text-[#f6dfaa] sm:text-xs sm:tracking-[0.34em]"
                onClick={closeLightbox}
              >
                Exit
              </button>
              {lightbox.images.length > 1 ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center px-1 py-2 text-[1.4rem] font-light leading-none text-white transition hover:text-[#f6dfaa]"
                    onClick={() => moveLightbox("prev")}
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center px-1 py-2 text-[1.4rem] font-light leading-none text-white transition hover:text-[#f6dfaa]"
                    onClick={() => moveLightbox("next")}
                  >
                    {">"}
                  </button>
                </div>
              ) : (
                <div />
              )}
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
