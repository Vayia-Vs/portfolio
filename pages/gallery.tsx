import Head from "next/head";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import path from "path";
import fs from "fs";
import { curatedImageOrder } from "@/content/homeContent";

type GalleryPageProps = {
  imagesFromFs: string[];
};

export default function GalleryPage({ imagesFromFs }: GalleryPageProps) {
  const rankedImages = new Map(curatedImageOrder.map((name, index) => [name, index]));
  const images = [...imagesFromFs].sort((a, b) => {
    const aRank = rankedImages.get(a) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rankedImages.get(b) ?? Number.MAX_SAFE_INTEGER;

    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });

  const toSrc = (name: string) => `/images/${encodeURIComponent(name)}`;
  const getPrimaryTagLabel = (name: string) => {
    const filename = name.split("/").pop() ?? "";
    const base = filename.replace(/\.[^/.]+$/, "");
    const primaryTag = base.split("-")[1]?.trim().toLowerCase();

    if (!primaryTag) return "COLLECTION";
    if (primaryTag === "archit") return "ARCHITECTURE";
    if (primaryTag === "landsc") return "LANDSCAPE";
    if (primaryTag === "int") return "INTERIOR";
    if (primaryTag === "street") return "STREET";
    return primaryTag.toUpperCase();
  };

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
              <div
                key={name}
                className="animate-gallery-item group"
                style={{ animationDelay: `${Math.min(index, 14) * 60}ms` }}
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/54 via-transparent to-transparent opacity-70 transition duration-500 group-hover:opacity-95" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-[9px] uppercase tracking-[0.24em] text-white/78 sm:text-[10px] sm:tracking-[0.3em]">
                      {getPrimaryTagLabel(name)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<GalleryPageProps> = async () => {
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
