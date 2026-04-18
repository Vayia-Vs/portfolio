import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProjectBySlug, projectsContent } from "@/content/projectsContent";

type ProjectPageProps = {
  projectSlug: string;
};

export default function ProjectPage({ projectSlug }: ProjectPageProps) {
  const project = getProjectBySlug(projectSlug);

  if (!project) return null;

  return (
    <>
      <Head>
        <title>{project.en.title} | Vayia Vasileiou</title>
        <meta name="description" content={project.en.summary} />
      </Head>
      <main className="min-h-screen bg-black px-4 py-14 text-white sm:px-8 md:px-16 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-[#d7b46a] hover:text-[#f6dfaa]"
            >
              Back home
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-[#d7b46a] bg-[#d7b46a] px-4 py-2 text-sm text-black transition hover:border-[#f6dfaa] hover:bg-[#f6dfaa]"
            >
              More projects
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/45">
                {project.year}
              </p>
              <h1 className="font-serif text-4xl italic sm:text-5xl">{project.en.title}</h1>
              <p className="mt-5 text-base leading-8 text-white/65">{project.en.intro}</p>
              <div className="mt-8 space-y-4 text-sm leading-8 text-white/58">
                {project.en.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {project.images.map((imageName, index) => (
                <div
                  key={imageName}
                  className={`relative overflow-hidden rounded-[1.35rem] border border-white/8 bg-white/[0.03] ${
                    index === 0 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className={index === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}>
                    <Image
                      src={`/images/${encodeURIComponent(imageName)}`}
                      alt={`${project.en.title} ${index + 1}`}
                      fill
                      sizes={index === 0 ? "(min-width: 1024px) 54vw, 100vw" : "(min-width: 1024px) 26vw, 50vw"}
                      className="object-cover"
                      quality={74}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: projectsContent.map((project) => ({ params: { slug: project.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({ params }) => {
  return {
    props: {
      projectSlug: String(params?.slug ?? ""),
    },
  };
};
