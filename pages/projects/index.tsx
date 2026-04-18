import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { projectsContent } from "@/content/projectsContent";

export default function ProjectsIndex() {
  return (
    <>
      <Head>
        <title>Projects | Vayia Vasileiou</title>
        <meta
          name="description"
          content="Selected photography projects by Vayia Vasileiou across street, portrait, and atmospheric work."
        />
      </Head>
      <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-8 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between gap-4">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/45">
                Selected work
              </p>
              <h1 className="font-serif text-4xl italic sm:text-5xl">Projects</h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-[#d7b46a] hover:text-[#f6dfaa]"
            >
              Back home
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projectsContent.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-[#d7b46a]/70"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={`/images/${encodeURIComponent(project.cover)}`}
                    alt={project.en.title}
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 90vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    quality={72}
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-2xl italic">{project.en.title}</h2>
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                      {project.year}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-white/60">{project.en.summary}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
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
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

