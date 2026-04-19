import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { curatedImageOrder } from "@/content/homeContent";
import { getGalleryImages } from "@/lib/galleryImages";
import { getImageName, toImageSrc } from "@/lib/galleryImageHelpers";

type GalleryPageProps = {
  galleryImages: string[];
};

export default function GalleryPage({ galleryImages }: GalleryPageProps) {
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    images: string[];
    index: number;
  }>({ open: false, images: [], index: 0 });
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "none">("none");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const images = useMemo(() => {
    const rankedImages = new Map(curatedImageOrder.map((name, index) => [name, index]));
    return [...galleryImages].sort((a, b) => {
      const aName = getImageName(a);
      const bName = getImageName(b);
      const aRank = rankedImages.get(aName) ?? Number.MAX_SAFE_INTEGER;
      const bRank = rankedImages.get(bName) ?? Number.MAX_SAFE_INTEGER;

      if (aRank !== bRank) return aRank - bRank;
      return aName.localeCompare(bName);
    });
  }, [galleryImages]);

  const toSrc = (name: string) => toImageSrc(name);
  const getPrimaryTagLabel = (name: string) => {
    const filename = getImageName(name);
    const base = filename.replace(/\.[^/.]+$/, "");
    const primaryTag = base.split("-")[1]?.trim().toLowerCase();

    if (!primaryTag) return "COLLECTION";
    if (primaryTag === "archit") return "ARCHITECTURE";
    if (primaryTag === "landsc") return "LANDSCAPE";
    if (primaryTag === "int") return "INTERIOR";
    if (primaryTag === "street") return "STREET";
    return primaryTag.toUpperCase();
  };

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

  return (
    <>
      <Head>
        <title>Gallery | Vayia Vasileiou</title>
        <meta
          name="description"
          content="A loose selection of photographs by Vayia Vasileiou across street, portrait, architecture, and atmospheric work."
        />
      </Head>
      <main className="min-h-screen bg-black px-4 py-14 text-white sm:px-8 md:px-16 md:py-16">
        <div className="mx-auto max-w-[92rem]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/45">
                Selected frames
              </p>
              <h1 className="font-serif text-4xl italic sm:text-5xl">Gallery</h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-[#d7b46a] hover:text-[#f6dfaa]"
            >
              Back home
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-5">
            {images.map((name, index) => (
              <button
                key={name}
                type="button"
                className="animate-gallery-item group text-left"
                style={{ animationDelay: `${Math.min(index, 14) * 60}ms` }}
                onClick={() => openLightbox(images, index)}
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/[0.04] shadow-[0_18px_46px_rgba(0,0,0,0.22)] transition duration-500 group-hover:-translate-y-1 group-hover:border-[#d7b46a]/60">
                  <Image
                    src={toSrc(name)}
                    alt={`${getPrimaryTagLabel(name).toLowerCase()} photograph`}
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 19vw, (min-width: 768px) 30vw, 46vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.02]"
                    priority={index < 10}
                    quality={index < 10 ? 74 : 68}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Link
        href="/#gallery"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full border border-[#d7b46a] bg-[#d7b46a] px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-black shadow-[0_0_24px_rgba(215,180,106,0.28)] transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa] sm:bottom-8 sm:right-8 sm:text-sm"
      >
        Back to Gallery
      </Link>

      {lightbox.open && (
        <div
          className={`lightbox-overlay fixed inset-0 z-[100] overflow-hidden bg-black/92 p-3 sm:p-6 ${
            isLightboxClosing ? "lightbox-overlay-out" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
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
              <div
                key={`${lightbox.images[lightbox.index]}-${slideDirection}`}
                className={`lightbox-image lightbox-image-${slideDirection} relative z-10 h-[68svh] w-[86vw] max-w-5xl sm:h-[70vh] sm:w-[84vw]`}
              >
                <Image
                  src={toSrc(lightbox.images[lightbox.index])}
                  alt={`${getPrimaryTagLabel(lightbox.images[lightbox.index]).toLowerCase()} photograph`}
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
    </>
  );
}

export const getStaticProps: GetStaticProps<GalleryPageProps> = async () => {
  const galleryImages = await getGalleryImages();

  return {
    props: {
      galleryImages,
    },
    revalidate: 300,
  };
};
