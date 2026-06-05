import { getTranslations } from "next-intl/server";
import { VideoPlayer } from "@/components/public/about/video-player";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

interface PageParams {
  locale: string;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const t = await getTranslations("SectionTitles");
  const tAbout = await getTranslations("About");
  const about = await getAboutPage(toLocale(locale));

  const hasValues = about.values.some((v) => v.title.trim() || v.description.trim());

  return (
    <div className="relative">
      <SectionIndex value="01" />
      <PageHeader eyebrow={t("aboutEyebrow")} title={t("whoWeAreTitle")} />

      {about.intro && (
        <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg">
            {about.intro}
          </p>
        </ScrollReveal>
      )}

      {about.videoUrl && (
        <ScrollReveal className="mx-auto mb-12 max-w-4xl">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {tAbout("videoProfile")}
          </p>
          <VideoPlayer src={about.videoUrl} />
        </ScrollReveal>
      )}

      {(about.vision || about.mission) && (
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {about.vision && (
            <ScrollReveal className="group/vm relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md md:p-8">
              {/* Top accent stripe — slides in on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/vm:scale-x-100"
              />
              {/* Diagonal corner cut — soft brand-accent triangle in bottom-right */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 bg-brand-accent/6 transition-all duration-300 group-hover/vm:bg-brand-accent/10"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
              />
              <span className="mb-4 block h-0.75 w-10 bg-brand-accent" aria-hidden />
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
                {tAbout("vision")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                {about.vision}
              </p>
            </ScrollReveal>
          )}
          {about.mission && (
            <ScrollReveal
              delay={120}
              className="group/vm relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md md:p-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/vm:scale-x-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 bg-brand-accent/6 transition-all duration-300 group-hover/vm:bg-brand-accent/10"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
              />
              <span className="mb-4 block h-0.75 w-10 bg-brand-accent" aria-hidden />
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
                {tAbout("mission")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                {about.mission}
              </p>
            </ScrollReveal>
          )}
        </div>
      )}

      {hasValues && (
        <section className="mb-12">
          <ScrollReveal className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
            <h2 className="text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
              {tAbout("values")}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value, idx) => (
              <ScrollReveal
                // biome-ignore lint/suspicious/noArrayIndexKey: values is an ordered editor list
                key={idx}
                delay={idx * 80}
                className="group/val relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md"
              >
                {/* Top accent stripe */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/val:scale-x-100"
                />
                {/* Corner triangle */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 bg-brand-accent/6 transition-all duration-300 group-hover/val:bg-brand-accent/10"
                  style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                />
                {/* Mono index — larger, brand-accent focal point */}
                <span className="block font-mono text-2xl font-bold tracking-tight text-brand-accent">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-brand-deep transition-colors group-hover/val:text-brand-accent dark:text-foreground">
                  {value.title}
                </h3>
                {value.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                )}
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
