import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
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

const featuredCategoryOrder: Record<string, string[]> = {
  street: [
    "ist8-street.jpg",
    "rome7-street.png",
    "greece3-street.png",
    "skg1-street-int.jpg",
    "ist10-street.png",
    "greece4-street.png",
    "rome1-street.png",
    "ist4-street.jpg",
  ],
  landsc: [
    "greece1-landsc.png",
    "ist15-landsc.jpg",
    "greece2-landsc.png",
    "greece5-street.png",
  ],
  archit: [
    "rome2-archit.png",
    "ist1-archit-int.png",
    "rome8-archit-int.png",
    "ist7-archit.png",
    "ist9-archit.png",
    "rome3-archit-int.png",
    "rome6-archit.png",
  ],
  int: [
    "rome4-int.png",
    "rome8-archit-int.png",
    "rome3-archit-int.png",
    "ist1-archit-int.png",
    "skg1-street-int.jpg",
  ],
};

const siteUrl = "https://vayia-vs-portfolio.vercel.app";

export default function Home({ imagesFromFs }: HomeProps) {
  /* ================= STATE ================= */
  const [scrolled, setScrolled] = useState(false);
  const [isAtPageBottom, setIsAtPageBottom] = useState(false);
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [lang, setLang] = useState<"en" | "gr">("en");
  const [viewMode, setViewMode] = useState<"auto" | "mobile" | "desktop">("auto");
  const [hasChosenView, setHasChosenView] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(5); // Gallery items shown
  const [activeFilter, setActiveFilter] = useState("all");
  const [mobileGalleryVisible, setMobileGalleryVisible] = useState<Record<string, number>>({});
  const [mobileGalleryIndex, setMobileGalleryIndex] = useState<Record<string, number>>({});
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
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const mobileGalleryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messageTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  /* ================= TEXTS ================= */
  const T = {
    en: {
      nav: [
        { label: "Gallery", target: "gallery" },
        { label: "About", target: "about" },
        { label: "Contact", target: "contact" },
      ],
      heroTitle1: "Capturing",
      heroTitle2: "Moments",
      heroTitle3: "in Time",
      heroText:
        "Street, portrait, and atmospheric photography shaped by quiet observation, natural light, and real moments.",
      viewGallery: "View Gallery",
      contactButton: "Get in Touch",
      galleryTitle: "My Collections",
      showMore: "more...",
      aboutTitle1: "The Art",
      aboutTitle2: "of Seeing",
      aboutKicker: "About the work",
      aboutText: [
        "I photograph the city as it unfolds: small gestures, passing light, and the quiet tension between people and place.",
        "My work moves between street photography, portraiture, architecture, and landscapes, always guided by atmosphere rather than performance.",
        "I am drawn to images that feel intimate and unforced. Even when the frame is simple, I want it to carry rhythm, stillness, and a sense of presence.",
        "Based in Athens and available for selected collaborations.",
      ],
      contactTitle1: "Let's Work",
      contactTitle2: "Together",
      contactKicker: "Get in touch",
      contactText:
        "If you have a portrait session, a brand idea, or a visual project in mind, send me a message and we can shape it together.",
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
          title: "Portraits",
          text: "Editorial-feeling portraits, couples sessions, and quiet personal photographs with a natural, relaxed direction.",
        },
        {
          icon: "product",
          title: "Brand & Product",
          text: "Clean, atmospheric imagery for small businesses, personal brands, online shops, and visual campaigns.",
        },
        {
          icon: "walks",
          title: "Creative Sessions",
          text: "Collaborative shoots and visual storytelling sessions built around mood, location, and the identity of the project.",
        },
      ],
      inquire: "Inquire",
      portraitCaption: "Quiet moments, honest presence",
    },
    gr: {
      nav: [
        { label: "Συλλογές", target: "gallery" },
        { label: "Σχετικά με εμένα", target: "about" },
        { label: "Επικοινωνία", target: "contact" },
      ],
      heroTitle1: "Στιγμές",
      heroTitle2: "που",
      heroTitle3: "μένουν",
      heroText:
        "Φωτογραφίες δρόμου, πορτρέτα και εικόνες ατμόσφαιρας με έμφαση στο φως, την παρατήρηση και τις αληθινές στιγμές.",
      viewGallery: "Περιήγηση",
      contactButton: "Επικοινωνία",
      galleryTitle: "Οι Συλλογές μου",
      showMore: "Περισσοτερα",
      aboutTitle1: "Πίσω",
      aboutTitle2: "από τον φακό",
      aboutKicker: "Σχετικά με εμένα",
      aboutText: [
        "Φωτογραφίζω την πόλη όπως αποκαλύπτεται: μικρές κινήσεις, περαστικό φως και τη σχέση ανάμεσα στους ανθρώπους και τον χώρο.",
        "Η δουλειά μου κινείται ανάμεσα στη φωτογραφία δρόμου, τα πορτρέτα, την αρχιτεκτονική και τα τοπία, με βάση πάντα την ατμόσφαιρα και όχι τη σκηνοθεσία.",
        "Με ενδιαφέρουν οι εικόνες που νιώθουν ήσυχες αλλά παρούσες. Ακόμα και όταν το κάδρο είναι απλό, θέλω να κρατά ρυθμό, αλήθεια και χαρακτήρα.",
        "Με αφετηρία την Αθήνα και διάθεση για επιλεγμένες συνεργασίες.",
      ],
      contactTitle1: "Επικοινώνησε",
      contactTitle2: "Εδώ",
      contactKicker: "",
      contactText:
        "Αν έχεις στο μυαλό σου ένα πορτρέτο, μια ιδέα για brand ή ένα φωτογραφικό project, στείλε μου μήνυμα να το δούμε μαζί.",
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
      servicesKicker: "",
      servicesTitle: "",
      services: [
        {
          icon: "portrait",
          title: "Πορτρέτα",
          text: "Πορτρέτα με φυσικό ρυθμό, φωτογραφίσεις για ζευγάρια και προσωπικές λήψεις με ήρεμη, ανεπιτήδευτη κατεύθυνση.",
        },
        {
          icon: "product",
          title: "Brand & Προϊόν",
          text: "Καθαρές και ατμοσφαιρικές εικόνες για μικρές επιχειρήσεις, personal brands, e-shops και οπτικές καμπάνιες.",
        },
        {
          icon: "walks",
          title: "Δημιουργικά Sessions",
          text: "Συνεργατικές φωτογραφίσεις και visual storytelling με βάση τη διάθεση, το location και την ταυτότητα του project.",
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
    setItemsToShow(5);
  }, [activeFilter]);

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
  const seoImage = `${siteUrl}/images/hero.jpg`;

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

  const allTags = Array.from(new Set(images.flatMap(parseTags))).sort();

  const filters = ["all", ...allTags];
  const filterCounts = images.reduce<Record<string, number>>((acc, name) => {
    parseTags(name).forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});
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
    : "grid grid-cols-6 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:gap-10 justify-items-center";
  const galleryImageSizes = isDesktopGallery
    ? "(min-width: 1280px) 18vw, (min-width: 1024px) 20vw, 33vw"
    : "(min-width: 1024px) 33vw, (min-width: 420px) 50vw, 100vw";
  const mobileGallerySections = useMemo(
    () =>
      allTags.map((tag) => {
        const tagImages = images.filter((name) => parseTags(name).includes(tag));
        const featuredOrder = new Map(
          (featuredCategoryOrder[tag] ?? []).map((name, index) => [name, index]),
        );

        const orderedImages = [...tagImages].sort((a, b) => {
          const aRank = featuredOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
          const bRank = featuredOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
          if (aRank !== bRank) return aRank - bRank;
          return a.localeCompare(b);
        });

        return {
          key: tag,
          title:
            tag === "archit"
              ? isGreek
                ? "ΑΡΧΙΤΕΚΤΟΝΙΚΗ"
                : "ARCHITECTURE"
              : tag === "landsc"
                ? isGreek
                  ? "ΤΟΠΙΑ"
                  : "LANDSCAPE"
                : tag === "int"
                  ? isGreek
                    ? "ΕΣΩΤΕΡΙΚΟΙ ΧΩΡΟΙ"
                    : "INTERIOR"
                  : tag === "street"
                    ? isGreek
                      ? "ΦΩΤΟΓΡΑΦΙΑ ΔΡΟΜΟΥ"
                      : "STREET"
                    : formatUiLabel(tag),
          images: orderedImages,
        };
      }),
    [allTags, formatUiLabel, images, isGreek],
  );

  useEffect(() => {
    if (!allTags.length) return;

    setMobileGalleryVisible((prev) => {
      const next: Record<string, number> = {};
      allTags.forEach((tag) => {
        next[tag] = prev[tag] ?? 5;
      });
      return next;
    });

    setMobileGalleryIndex((prev) => {
      const next: Record<string, number> = {};
      allTags.forEach((tag) => {
        next[tag] = prev[tag] ?? 0;
      });
      return next;
    });
  }, [allTags]);

  const handleMobileGalleryScroll = (key: string) => {
    const element = mobileGalleryRefs.current[key];
    if (!element) return;
    const card = element.querySelector<HTMLElement>("[data-mobile-gallery-card='true']");
    const cardWidth = card?.offsetWidth ?? 1;

    setMobileGalleryIndex((prev) => ({
      ...prev,
      [key]: Math.round(element.scrollLeft / cardWidth),
    }));
  };

  const scrollMobileGalleryTo = (key: string, index: number) => {
    const element = mobileGalleryRefs.current[key];
    const card = element?.querySelector<HTMLElement>("[data-mobile-gallery-card='true']");
    if (!element || !card) return;

    element.scrollTo({
      left: card.offsetWidth * index,
      behavior: "smooth",
    });
  };

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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
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
        <nav className="px-4 sm:px-6">
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

          <div className="mt-2 flex flex-row items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={() => scrollTo("gallery")}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-3.5 py-2 text-[9px] uppercase tracking-[0.18em] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)] sm:min-h-0 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
            >
              {T[lang].viewGallery} ↓
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.16em] text-white transition hover:border-[#d7b46a] hover:bg-[#d7b46a]/12 hover:text-[#f6dfaa] sm:min-h-0 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
            >
              {T[lang].contactButton}
            </button>
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section
        id="gallery"
        className="gallery-backdrop relative overflow-hidden border-t border-white/10 px-4 py-8 sm:px-8 sm:py-16 md:px-20 md:py-24"
      >
        <div className={galleryContainerClass}>
          <h2 className={`mb-6 text-3xl italic text-white sm:mb-10 sm:text-4xl md:mb-20 md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
            {T[lang].galleryTitle}
          </h2>

          {isMobileLayout ? (
            <div className="space-y-9">
              {mobileGallerySections.map((section) => {
                const sectionVisible = section.images.slice(0, mobileGalleryVisible[section.key]);
                const sectionIndex = Math.min(
                  mobileGalleryIndex[section.key],
                  Math.max(sectionVisible.length - 1, 0),
                );

                return (
                  <div key={section.key} className="space-y-3 rounded-[1.55rem] border border-[#d7b46a]/55 bg-[rgba(215,180,106,0.26)] px-4 py-4 shadow-[0_20px_42px_rgba(0,0,0,0.18)]">
                    <div className="flex items-end justify-between gap-3">
                      <h3 className="text-sm uppercase tracking-[0.28em] text-white sm:text-lg sm:tracking-[0.24em]">
                        {section.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/65">
                        {section.images.length}
                      </span>
                    </div>

                    <div
                      ref={(element) => {
                        mobileGalleryRefs.current[section.key] = element;
                      }}
                      className="mobile-gallery-track hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
                      onScroll={() => handleMobileGalleryScroll(section.key)}
                    >
                      {sectionVisible.map((name, index) => (
                        <button
                          key={`${section.key}-${name}`}
                          type="button"
                          data-mobile-gallery-card="true"
                          className="animate-gallery-item relative aspect-square w-[72vw] shrink-0 snap-start overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/10 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-all duration-300"
                          style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
                          onClick={() => openLightbox(sectionVisible, index)}
                        >
                          <Image
                            src={toSrc(name)}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 280px, 72vw"
                            className="object-cover"
                            priority={section.key === mobileGallerySections[0]?.key && index === 0}
                            quality={index === 0 ? 74 : 68}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {sectionVisible.map((_, index) => (
                          <button
                            key={`${section.key}-dot-${index}`}
                            type="button"
                            aria-label={`Go to ${section.title} image ${index + 1}`}
                            onClick={() => scrollMobileGalleryTo(section.key, index)}
                            className={`h-2.5 rounded-full transition-all ${
                              sectionIndex === index
                                ? "w-5 bg-white"
                                : "w-2.5 bg-white/40"
                            }`}
                          />
                        ))}
                      </div>

                      {section.images.length > mobileGalleryVisible[section.key] && (
                        <button
                          type="button"
                          onClick={() =>
                            setMobileGalleryVisible((prev) => ({
                              ...prev,
                              [section.key]: prev[section.key] + 5,
                            }))
                          }
                          className="text-[10px] uppercase tracking-[0.18em] text-white transition hover:text-[#f6dfaa]"
                        >
                          {T[lang].showMore}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-white/70 sm:mb-10 sm:flex-wrap sm:gap-3 sm:text-xs sm:tracking-[0.3em]">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-11 shrink-0 rounded-full border px-3 py-2 font-normal uppercase tracking-[0.22em] transition sm:rounded sm:px-4 sm:tracking-[0.3em] ${
                      activeFilter === filter
                        ? "border-[#d7b46a] bg-[#d7b46a] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)]"
                        : "border-[#d7b46a]/60 bg-[#d7b46a]/10 text-[#f6dfaa] hover:border-[#f6dfaa] hover:bg-[#d7b46a] hover:text-black"
                    }`}
                  >
                    {(filter === "all"
                      ? "ALL"
                      : filter === "archit"
                        ? "ARCHITECTURE"
                        : filter === "landsc"
                          ? "LANDSCAPE"
                          : filter === "int"
                            ? "INTERIOR"
                            : filter === "street"
                              ? "STREET PHOTOGRAPHY"
                              : filter.toUpperCase())}
                    <span className="ml-2 text-[9px] opacity-70">
                      {filter === "all" ? images.length : (filterCounts[filter] ?? 0)}
                    </span>
                  </button>
                ))}
              </div>

              <div className={galleryGridClass}>
                {visibleImages.slice(0, itemsToShow).map((name, index) => {
                  const heightClass = isDesktopGallery
                    ? "h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96"
                    : "h-44 sm:h-56 md:h-72 lg:h-96";
                  const itemClass = isDesktopGallery
                    ? "animate-gallery-item w-full text-left group"
                    : "animate-gallery-item w-full text-left group sm:max-w-[420px]";

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
                          priority={index < 3}
                          quality={index < 3 ? 74 : 68}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {visibleImages.length > itemsToShow && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setItemsToShow((current) => current + 5)}
                    className="rounded-full border border-[#d7b46a] bg-[#d7b46a] px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] hover:shadow-[0_0_26px_rgba(215,180,106,0.32)] sm:rounded sm:px-8 sm:text-sm sm:tracking-widest"
                  >
                    {T[lang].showMore} ↓
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="border-t border-white/10 px-4 py-16 sm:px-8 md:px-16 md:py-24 xl:px-20 xl:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-20">
          <div className="mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none lg:pr-8 lg:pt-4">
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

          <div className="max-w-[44rem] lg:pt-6">
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
      <section className="relative flex min-h-[96svh] items-center overflow-hidden border-t border-white/10 bg-black px-4 py-16 sm:px-8 sm:py-18 md:px-20 md:py-20">
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
        <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-sm lg:sticky lg:top-28">
            {T[lang].servicesKicker ? (
              <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/50 sm:mb-6 sm:text-xs sm:tracking-[0.4em]">
                {formatUiLabel(T[lang].servicesKicker)}
              </p>
            ) : null}
            <h2 className={`max-w-xs text-3xl italic leading-tight text-white sm:text-4xl md:text-[2.85rem] ${isGreek ? "font-sans" : "font-serif"}`}>
              {isGreek ? "Τροποι συνεργασιας" : "Ways We Can Work Together"}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              {isGreek
                ? "Απο προσωπα και brands μεχρι πιο ατμοσφαιρικα δημιουργικα sessions, η καθε συνεργασια χτιζεται με βαση το υφος και την αισθηση που θελεις να κρατησει η εικονα."
                : "From portraits and brands to more atmospheric creative sessions, each collaboration is shaped around mood, clarity, and the feeling the images should leave behind."}
            </p>
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {T[lang].services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-[1.15rem] border border-[#d7b46a]/38 bg-black/52 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:border-[#f6dfaa] hover:bg-black/66 hover:shadow-[0_0_18px_rgba(215,180,106,0.14)] sm:rounded-lg sm:p-6 lg:min-h-[290px]"
                >
                  <h3 className={`mb-3 text-[1.35rem] leading-tight sm:text-[1.55rem] ${isGreek ? "font-sans" : "font-serif"}`}>{service.title}</h3>
                  <p className="mb-6 text-sm leading-7 text-white/60">{service.text}</p>
                  <a href="#contact" className="text-sm uppercase tracking-[0.24em] text-[#d7b46a] transition hover:text-[#f6dfaa] sm:tracking-widest">
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
        className="flex min-h-[100svh] items-center border-t border-white/10 px-4 py-16 sm:px-8 sm:py-20 md:px-20 md:py-32"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
          <div className="text-center lg:sticky lg:top-28 lg:text-left">
            {T[lang].contactKicker ? (
              <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-white/60 sm:mb-6 sm:text-xs sm:tracking-[0.5em]">
                {formatUiLabel(T[lang].contactKicker)}
              </p>
            ) : null}
            <h2 className={`mb-4 text-3xl italic sm:mb-6 sm:text-4xl md:text-5xl ${isGreek ? "font-sans" : "font-serif"}`}>
              {T[lang].contactTitle1}{" "}
              <span>{T[lang].contactTitle2}</span>
            </h2>
            <p className="mx-auto mb-5 max-w-md text-sm leading-7 text-white/60 sm:text-base md:leading-relaxed lg:mx-0">
              {T[lang].contactText}
            </p>
            <a
              href={`mailto:${T[lang].contactEmail}`}
              className="inline-flex text-sm tracking-[0.18em] text-[#d7b46a] transition hover:text-[#f6dfaa]"
            >
              {T[lang].contactEmail}
            </a>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="mx-auto w-full max-w-3xl space-y-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6 text-left shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:space-y-10 sm:px-8 sm:py-8"
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
                  className="min-h-8 w-full resize-none bg-transparent py-1 text-white/80 placeholder:text-white/35 transition focus:outline-none"
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

          </form>
        </div>
      </section>
      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-[#111716] px-4 py-6 sm:px-8 md:px-20">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <p className="justify-self-start text-[11px] text-white/50 sm:text-sm">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
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
            className="h-7 w-auto justify-self-end opacity-75 sm:h-10"
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
                  alt=""
                  fill
                  sizes="84vw"
                  className="object-contain"
                  priority
                  quality={78}
                />
              </div>
            </div>
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
