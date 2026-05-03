import { resolveApiAssetUrl } from "@/api/apiClient";
import { ArrowUpRight, Award, Gem, Heart, PenTool, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  gem: Gem,
  award: Award,
  pen: PenTool,
  heart: Heart,
  sparkles: Sparkles,
};

export interface HeroPreviewModel {
  eyebrowText: string;
  headlineLine1: string;
  headlineAccent: string;
  subheading: string;
  caption: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  backgroundImageUrl: string;
  highlightsCardTitle: string;
  highlights: { title: string; subtitle: string; imageUrl: string }[];
  deskHeading: string;
  deskPhone: string;
  deskEmail: string;
}

export interface WhyPreviewModel {
  overline: string;
  heading: string;
  description: string;
  items: { iconKey: string; title: string; description: string }[];
}

export interface StoryPreviewModel {
  overline: string;
  headingLine1: string;
  headingAccent: string;
  paragraphs: string[];
  stats: { value: string; label: string }[];
  imageUrl: string;
}

function assetUrl(path: string) {
  return resolveApiAssetUrl(path) || path;
}

export function HeroSectionLivePreview({ data }: { data: HeroPreviewModel }) {
  const bg = assetUrl(data.backgroundImageUrl);

  return (
    <div className="rounded-xl border border-border/60 bg-black text-white shadow-inner overflow-hidden">
      <div
        className="relative min-h-[360px] md:min-h-[420px] flex flex-col"
        style={{
          backgroundImage: `linear-gradient(100deg,rgba(12,12,10,0.88)_8%,rgba(18,16,14,0.6)_55%,rgba(18,16,14,0.25)_100%), url('${bg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 18%, oklch(0.7 0.12 80 / 0.22), transparent 40%)",
          }}
        />
        <div className="relative z-10 grid w-full max-w-5xl mx-auto gap-8 px-5 py-8 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "oklch(0.78 0.12 82)" }}
            >
              {data.eyebrowText}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              {data.headlineLine1}
              <br />
              <span className="italic" style={{ color: "oklch(0.86 0.09 84)" }}>
                {data.headlineAccent}
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/82">
              {data.subheading}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.67 0.12 76), oklch(0.78 0.11 82))",
                  color: "oklch(0.12 0.01 60)",
                }}
              >
                {data.primaryCtaLabel}
                <ArrowUpRight size={14} aria-hidden />
              </span>
              <span
                className="inline-flex rounded-full border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] border-white/28 bg-white/[0.08]"
              >
                {data.secondaryCtaLabel}
              </span>
            </div>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-white/72">{data.caption}</p>
          </div>

          <div className="relative z-10 hidden md:block">
            <div
              className="ml-auto max-w-[280px] rounded-[22px] p-5 backdrop-blur-xl"
              style={{
                background:
                  "linear-gradient(180deg, oklch(1 0 0 / 0.14), oklch(0.12 0.01 60 / 0.38))",
                border: "1px solid oklch(1 0 0 / 0.14)",
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.26em]"
                style={{ color: "oklch(0.82 0.11 82)" }}
              >
                {data.highlightsCardTitle}
              </p>
              <div className="mt-4 space-y-3">
                {data.highlights.slice(0, 6).map((row, index) => {
                  const src = row.imageUrl ? assetUrl(row.imageUrl) : "";
                  return (
                    <div
                      key={`${row.title}-${index}`}
                      className="flex items-center gap-3 rounded-[16px] px-3 py-2.5"
                      style={{
                        background:
                          index === 0 ? "oklch(1 0 0 / 0.12)" : "oklch(1 0 0 / 0.06)",
                      }}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          className="h-11 w-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="h-11 w-12 shrink-0 rounded-xl bg-white/10"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold leading-snug">{row.title}</p>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-white/58">
                          {row.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(data.deskPhone || data.deskEmail) && (
                <div
                  className="mt-4 rounded-[18px] px-4 py-3"
                  style={{
                    background: "oklch(1 0 0 / 0.08)",
                    border: "1px solid oklch(0.65 0.12 75 / 0.22)",
                  }}
                >
                  <p className="text-[15px] font-semibold mb-2">{data.deskHeading}</p>
                  <div className="space-y-1 text-[11px] text-white/76">
                    {data.deskPhone ? <p>{data.deskPhone}</p> : null}
                    {data.deskEmail ? <p>{data.deskEmail}</p> : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="relative z-10 pb-4 text-center text-[9px] uppercase tracking-[0.26em] text-white/48 md:hidden">
          Narrow preview — full layout on desktop site
        </p>
      </div>
    </div>
  );
}

export function WhyChooseLivePreview({ data }: { data: WhyPreviewModel }) {
  return (
    <div
      className="rounded-xl border border-border/70 bg-[oklch(0.985_0.006_85)] px-4 py-8 sm:px-6 shadow-inner"
    >
      <div className="mx-auto max-w-5xl text-center mb-8">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-2"
          style={{ color: "oklch(0.65 0.12 75)" }}
        >
          {data.overline}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{data.heading}</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {data.description}
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.slice(0, 9).map((item, i) => {
          const Icon = ICONS[item.iconKey?.toLowerCase?.() ?? ""] ?? Sparkles;
          return (
            <div
              key={`${item.title}-${i}`}
              className="rounded-sm bg-card p-6 border border-[oklch(0.87_0.02_80)] shadow-sm"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: "oklch(0.65 0.12 75 / 0.14)" }}
              >
                <Icon size={22} style={{ color: "oklch(0.55 0.14 65)" }} />
              </div>
              <p className="font-semibold text-[17px] text-foreground mb-2">{item.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OurStoryLivePreview({ data }: { data: StoryPreviewModel }) {
  const img = assetUrl(data.imageUrl);

  return (
    <div className="rounded-xl border border-border/70 bg-[oklch(0.985_0.006_85)] px-4 py-8 sm:px-6 shadow-inner">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "oklch(0.65 0.12 75)" }}
          >
            {data.overline}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground mb-6">
            {data.headingLine1}
            <br />
            <span className="italic">{data.headingAccent}</span>
          </h3>
          <div className="space-y-3 mb-8">
            {data.paragraphs.slice(0, 6).map((p, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-7">
            {data.stats.slice(0, 6).map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold" style={{ color: "oklch(0.65 0.12 75)" }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:justify-self-end w-full">
          <img
            src={img}
            alt=""
            className="relative z-[1] w-full max-h-[340px] object-cover rounded-sm shadow-lg"
          />
          <div
            className="pointer-events-none absolute -bottom-3 -right-3 hidden h-[88%] w-[92%] rounded-sm lg:block"
            style={{
              border: "2px solid oklch(0.65 0.12 75)",
              zIndex: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
