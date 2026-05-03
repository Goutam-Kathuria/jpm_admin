import {
  HeroSectionLivePreview,
  OurStoryLivePreview,
  WhyChooseLivePreview,
} from "@/components/website-content/WebsiteSectionPreviews";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchWebsiteContent,
  saveWebsiteContent,
  type WebsiteContentRecord,
} from "@/lib/websiteContentApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, ExternalLink, LayoutTemplate, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SectionId = "hero" | "why_choose_us" | "our_story";

const SECTIONS: {
  id: SectionId;
  label: string;
  modelKey: string;
  saveLabel: string;
}[] = [
  { id: "hero", label: "Home Hero", modelKey: "hero", saveLabel: "Save Home Hero" },
  {
    id: "why_choose_us",
    label: "Why Choose Us",
    modelKey: "why_choose_us",
    saveLabel: "Save Why Choose Us",
  },
  { id: "our_story", label: "Our Story", modelKey: "our_story", saveLabel: "Save Our Story" },
];

const heroDefaults = {
  eyebrowText: "Handcrafted luxury furniture from Hisar",
  headlineLine1: "Crafted for",
  headlineAccent: "beautiful living.",
  subheading:
    "Discover collection-led sofa experiences, tailored comfort, and a custom design journey built around your home, your taste, and your dimensions.",
  caption:
    "Every furniture piece is designed for lasting comfort, rich textures, and a polished finish that brings out the best in modern living.",
  primaryCtaLabel: "Explore Collections",
  secondaryCtaLabel: "Start Custom Design",
  backgroundImageUrl: "/assets/generated/hero-sofa.dim_1600x900.jpg",
  highlightsCardTitle: "Collection Highlights",
  highlightsSubtitleDefault: "Curated collection",
  deskHeading: "Speak with the design desk",
  deskPhone: "",
  deskEmail: "",
  highlights: [
    { title: "Tables", subtitle: "Curated collection", imageUrl: "" },
    { title: "Sofa", subtitle: "Curated collection", imageUrl: "" },
    { title: "Bed", subtitle: "Curated collection", imageUrl: "" },
  ],
};

const whyDefaults = {
  overline: "The JPM Difference",
  heading: "Why Choose JPM Enterprises",
  description:
    "Two decades of passionate craftsmanship have earned us the trust of homeowners, architects, and interior designers across India.",
  items: [
    {
      iconKey: "gem",
      title: "Premium Materials",
      description:
        "We source only the finest fabrics, leathers, and structural materials from trusted suppliers worldwide.",
    },
    {
      iconKey: "award",
      title: "Expert Craftsmanship",
      description:
        "Our artisans bring decades of experience to every seam, stitch, and joint in your furniture.",
    },
    {
      iconKey: "pen",
      title: "Custom Designs",
      description:
        "No two homes are alike. We create fully bespoke pieces tailored to your exact specification.",
    },
    {
      iconKey: "heart",
      title: "Long Lasting Comfort",
      description:
        "Engineered for durability with high-density foam and hardwood frames built to last decades.",
    },
    {
      iconKey: "sparkles",
      title: "Elegant Modern Styles",
      description:
        "Timeless aesthetics that complement contemporary interiors with understated sophistication.",
    },
  ],
};

const storyDefaults = {
  overline: "Our Story",
  headingLine1: "Craftsmanship at the",
  headingAccent: "Heart of Everything",
  paragraphs: [
    "Founded in 2005 in Hisar, JPM Enterprises began as a small workshop with a single vision: to create furniture that stands the test of time. Today, we are one of India's most trusted names in luxury sofa design and manufacturing.",
    "Every JPM piece is born from a deep respect for traditional craftsmanship, enriched with contemporary design sensibility. Our master craftsmen hand-select materials, hand-stitch upholstery, and hand-finish every detail — because we believe furniture should be as beautiful to make as it is to own.",
    "We don't just build sofas. We build heirlooms — pieces that become the anchor of your living space, companions for years of memories.",
  ],
  stats: [
    { value: "500+", label: "Happy Clients" },
    { value: "15+", label: "Years Experience" },
    { value: "1000+", label: "Sofas Crafted" },
  ],
  imageUrl: "/assets/generated/about-craftsmanship.dim_800x600.jpg",
};

const ICON_OPTIONS = [
  { value: "gem", label: "Gem" },
  { value: "award", label: "Award" },
  { value: "pen", label: "Pen / design" },
  { value: "heart", label: "Heart" },
  { value: "sparkles", label: "Sparkles" },
];

function deepMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return base;
  }
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function normalizeHeroData(raw: unknown) {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const merged = deepMerge(heroDefaults as unknown as Record<string, unknown>, patch);
  let highlights = Array.isArray((merged as { highlights?: unknown }).highlights)
    ? ([...(merged as { highlights: unknown[] }).highlights] as Record<string, unknown>[])
    : [...heroDefaults.highlights];

  highlights = highlights.slice(0, 8).map((row, index) => {
    const fallback = heroDefaults.highlights[index] ?? heroDefaults.highlights[0];
    return {
      title: String(row.title ?? fallback.title),
      subtitle: String(row.subtitle ?? fallback.subtitle ?? heroDefaults.highlightsSubtitleDefault),
      imageUrl: String(row.imageUrl ?? ""),
    };
  });

  return { ...merged, highlights } as typeof heroDefaults;
}

function normalizeWhyData(raw: unknown) {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const merged = deepMerge(whyDefaults as unknown as Record<string, unknown>, patch);
  let items = Array.isArray((merged as { items?: unknown }).items)
    ? ([...(merged as { items: unknown[] }).items] as Record<string, unknown>[])
    : [...whyDefaults.items];

  items = items.slice(0, 12).map((row, index) => {
    const fallback = whyDefaults.items[index] ?? whyDefaults.items[0];
    return {
      iconKey: String(row.iconKey ?? fallback.iconKey),
      title: String(row.title ?? fallback.title),
      description: String(row.description ?? fallback.description),
    };
  });

  return { ...merged, items } as typeof whyDefaults;
}

function normalizeStoryData(raw: unknown) {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const merged = deepMerge(storyDefaults as unknown as Record<string, unknown>, patch);

  let paragraphs = Array.isArray((merged as { paragraphs?: unknown }).paragraphs)
    ? (merged as { paragraphs: unknown[] }).paragraphs.map((p) => String(p))
    : [...storyDefaults.paragraphs];

  paragraphs = paragraphs.filter((p) => p.trim().length > 0);

  let stats = Array.isArray((merged as { stats?: unknown }).stats)
    ? ([...(merged as { stats: unknown[] }).stats] as Record<string, unknown>[])
    : [...storyDefaults.stats];

  stats = stats.slice(0, 8).map((row, index) => {
    const fallback = storyDefaults.stats[index] ?? storyDefaults.stats[0];
    return {
      value: String(row.value ?? fallback.value),
      label: String(row.label ?? fallback.label),
    };
  });

  return {
    ...merged,
    paragraphs: paragraphs.length ? paragraphs : storyDefaults.paragraphs,
    stats,
  } as typeof storyDefaults;
}

function contentQueryKey(modelKey: string) {
  return ["admin", "website-content", modelKey] as const;
}

export function WebsiteContentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SectionId>("hero");
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === activeTab) ?? SECTIONS[0],
    [activeTab],
  );

  const contentQuery = useQuery({
    queryKey: contentQueryKey(activeSection.modelKey),
    queryFn: () => fetchWebsiteContent(activeSection.modelKey),
  });

  const [visible, setVisible] = useState(true);
  const [heroForm, setHeroForm] = useState(heroDefaults);
  const [whyForm, setWhyForm] = useState(whyDefaults);
  const [storyForm, setStoryForm] = useState(storyDefaults);

  const applyRecord = useCallback(
    (record: WebsiteContentRecord | null, section: (typeof SECTIONS)[number]) => {
      setVisible(record?.visible ?? true);
      const data = record?.data ?? {};

      if (section.id === "hero") {
        setHeroForm(normalizeHeroData(data));
      } else if (section.id === "why_choose_us") {
        setWhyForm(normalizeWhyData(data));
      } else {
        setStoryForm(normalizeStoryData(data));
      }
    },
    [],
  );

  useEffect(() => {
    if (contentQuery.data === undefined && contentQuery.isLoading) {
      return;
    }
    applyRecord(contentQuery.data ?? null, activeSection);
  }, [contentQuery.data, contentQuery.isLoading, activeSection, applyRecord]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const section = activeSection;
      let data: object = {};

      if (section.id === "hero") {
        const { highlightsSubtitleDefault: _omit, ...heroPayload } = heroForm;
        data = heroPayload;
      } else if (section.id === "why_choose_us") {
        data = { ...whyForm };
      } else {
        data = { ...storyForm };
      }

      return saveWebsiteContent(section.modelKey, { visible, data });
    },
    onSuccess: (saved) => {
      if (saved) {
        queryClient.setQueryData(contentQueryKey(activeSection.modelKey), saved);
      }
      void queryClient.invalidateQueries({ queryKey: contentQueryKey(activeSection.modelKey) });
      toast.success("Website content saved.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Content"
        subtitle="Manage reusable homepage sections. Each tab maps to a model key consumed by the public site API."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Live section preview
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => window.open("/", "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open site
            </Button>
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || contentQuery.isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {activeSection.saveLabel}
            </Button>
          </div>
        }
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(90vh,900px)] w-[min(96vw,1150px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1150px)]"
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle className="font-display text-xl">
              {activeSection.label} preview
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2">
              Styled like the live website. Shows current form values — save to publish via the
              API.
              {!visible ? (
                <Badge variant="outline" className="text-xs">
                  Visibility off → hidden on public GET
                </Badge>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-[1100px] space-y-4">
              <Badge variant="secondary" className="font-mono text-[11px]">
                modelKey: {activeSection.modelKey}
              </Badge>
              {activeTab === "hero" ? <HeroSectionLivePreview data={heroForm} /> : null}
              {activeTab === "why_choose_us" ? (
                <WhyChooseLivePreview data={whyForm} />
              ) : null}
              {activeTab === "our_story" ? <OurStoryLivePreview data={storyForm} /> : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionId)}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-sm">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {section.label} section
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      modelKey: {section.modelKey}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <div className="space-y-0.5">
                  <Label htmlFor={`visible-${section.id}`} className="text-base">
                    Section visibility
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When off, the public API returns 404 for this key and the site keeps its static
                    fallback.
                  </p>
                </div>
                <Switch
                  id={`visible-${section.id}`}
                  checked={visible}
                  onCheckedChange={setVisible}
                />
              </div>

              <Separator className="my-6" />

              {section.id === "hero" ? (
                <HeroFields form={heroForm} onChange={setHeroForm} />
              ) : null}
              {section.id === "why_choose_us" ? (
                <WhyFields form={whyForm} onChange={setWhyForm} />
              ) : null}
              {section.id === "our_story" ? (
                <StoryFields form={storyForm} onChange={setStoryForm} />
              ) : null}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function HeroFields({
  form,
  onChange,
}: {
  form: typeof heroDefaults;
  onChange: (next: typeof heroDefaults) => void;
}) {
  const update = (patch: Partial<typeof heroDefaults>) => {
    onChange({ ...form, ...patch });
  };

  const updateHighlight = (
    index: number,
    patch: Partial<(typeof heroDefaults.highlights)[0]>,
  ) => {
    const highlights = form.highlights.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    update({ highlights });
  };

  const addHighlight = () => {
    update({
      highlights: [
        ...form.highlights,
        { title: "", subtitle: form.highlightsSubtitleDefault, imageUrl: "" },
      ],
    });
  };

  const removeHighlight = (index: number) => {
    update({ highlights: form.highlights.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow text">
          <Input
            value={form.eyebrowText}
            onChange={(e) => update({ eyebrowText: e.target.value })}
          />
        </Field>
        <Field label="Background image URL">
          <Input
            value={form.backgroundImageUrl}
            onChange={(e) => update({ backgroundImageUrl: e.target.value })}
            placeholder="/assets/... or https://"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Headline (first line)">
          <Input
            value={form.headlineLine1}
            onChange={(e) => update({ headlineLine1: e.target.value })}
          />
        </Field>
        <Field label="Headline accent (styled line)">
          <Input
            value={form.headlineAccent}
            onChange={(e) => update({ headlineAccent: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Subheading">
        <Textarea
          rows={3}
          value={form.subheading}
          onChange={(e) => update({ subheading: e.target.value })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Primary CTA label">
          <Input
            value={form.primaryCtaLabel}
            onChange={(e) => update({ primaryCtaLabel: e.target.value })}
          />
        </Field>
        <Field label="Secondary CTA label">
          <Input
            value={form.secondaryCtaLabel}
            onChange={(e) => update({ secondaryCtaLabel: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Bottom caption">
        <Textarea
          rows={2}
          value={form.caption}
          onChange={(e) => update({ caption: e.target.value })}
        />
      </Field>

      <Separator />

      <Field label="Highlights card title">
        <Input
          value={form.highlightsCardTitle}
          onChange={(e) => update({ highlightsCardTitle: e.target.value })}
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Highlight rows</Label>
          <Button type="button" size="sm" variant="outline" onClick={addHighlight}>
            <Plus className="mr-2 h-4 w-4" />
            Add row
          </Button>
        </div>
        {form.highlights.map((row, index) => (
          <div
            key={`h-${index}`}
            className="grid gap-3 rounded-lg border border-border/70 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <Field label="Title">
              <Input
                value={row.title}
                onChange={(e) => updateHighlight(index, { title: e.target.value })}
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={row.subtitle}
                onChange={(e) => updateHighlight(index, { subtitle: e.target.value })}
              />
            </Field>
            <Field label="Image URL (optional)">
              <Input
                value={row.imageUrl}
                onChange={(e) => updateHighlight(index, { imageUrl: e.target.value })}
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => removeHighlight(index)}
                aria-label="Remove highlight row"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <Field label="Design desk heading">
        <Input
          value={form.deskHeading}
          onChange={(e) => update({ deskHeading: e.target.value })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Desk phone override (optional)">
          <Input
            value={form.deskPhone}
            onChange={(e) => update({ deskPhone: e.target.value })}
            placeholder="Uses site settings when empty"
          />
        </Field>
        <Field label="Desk email override (optional)">
          <Input
            type="email"
            value={form.deskEmail}
            onChange={(e) => update({ deskEmail: e.target.value })}
            placeholder="Uses site settings when empty"
          />
        </Field>
      </div>
    </div>
  );
}

function WhyFields({
  form,
  onChange,
}: {
  form: typeof whyDefaults;
  onChange: (next: typeof whyDefaults) => void;
}) {
  const update = (patch: Partial<typeof whyDefaults>) => onChange({ ...form, ...patch });

  const updateItem = (
    index: number,
    patch: Partial<(typeof whyDefaults.items)[0]>,
  ) => {
    const items = form.items.map((row, i) => (i === index ? { ...row, ...patch } : row));
    update({ items });
  };

  const addItem = () => {
    update({
      items: [
        ...form.items,
        { iconKey: "gem", title: "", description: "" },
      ],
    });
  };

  const removeItem = (index: number) => {
    update({ items: form.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Field label="Overline">
        <Input value={form.overline} onChange={(e) => update({ overline: e.target.value })} />
      </Field>
      <Field label="Heading">
        <Input value={form.heading} onChange={(e) => update({ heading: e.target.value })} />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </Field>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Feature cards</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add card
          </Button>
        </div>
        {form.items.map((row, index) => (
          <div
            key={`f-${index}`}
            className="grid gap-3 rounded-lg border border-border/70 p-4 md:grid-cols-[160px_1fr_2fr_auto]"
          >
            <Field label="Icon">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.iconKey}
                onChange={(e) => updateItem(index, { iconKey: e.target.value })}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <Input value={row.title} onChange={(e) => updateItem(index, { title: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea
                rows={2}
                value={row.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                aria-label="Remove card"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryFields({
  form,
  onChange,
}: {
  form: typeof storyDefaults;
  onChange: (next: typeof storyDefaults) => void;
}) {
  const update = (patch: Partial<typeof storyDefaults>) => onChange({ ...form, ...patch });

  const updateStat = (index: number, patch: Partial<(typeof storyDefaults.stats)[0]>) => {
    const stats = form.stats.map((row, i) => (i === index ? { ...row, ...patch } : row));
    update({ stats });
  };

  const addStat = () => {
    update({ stats: [...form.stats, { value: "", label: "" }] });
  };

  const removeStat = (index: number) => {
    update({ stats: form.stats.filter((_, i) => i !== index) });
  };

  const paragraphsText = form.paragraphs.join("\n\n");

  return (
    <div className="space-y-6">
      <Field label="Overline">
        <Input value={form.overline} onChange={(e) => update({ overline: e.target.value })} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Heading (first line)">
          <Input
            value={form.headingLine1}
            onChange={(e) => update({ headingLine1: e.target.value })}
          />
        </Field>
        <Field label="Heading (accent line)">
          <Input
            value={form.headingAccent}
            onChange={(e) => update({ headingAccent: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Body paragraphs (blank line separates paragraphs)">
        <Textarea
          rows={8}
          value={paragraphsText}
          onChange={(e) => {
            const parts = e.target.value
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean);
            update({ paragraphs: parts.length ? parts : [e.target.value.trim()] });
          }}
        />
      </Field>

      <Field label="Image URL">
        <Input
          value={form.imageUrl}
          onChange={(e) => update({ imageUrl: e.target.value })}
          placeholder="/assets/... or https://"
        />
      </Field>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Stats</Label>
          <Button type="button" size="sm" variant="outline" onClick={addStat}>
            <Plus className="mr-2 h-4 w-4" />
            Add stat
          </Button>
        </div>
        {form.stats.map((row, index) => (
          <div
            key={`s-${index}`}
            className="grid gap-3 rounded-lg border border-border/70 p-4 md:grid-cols-[1fr_2fr_auto]"
          >
            <Field label="Value">
              <Input
                value={row.value}
                onChange={(e) => updateStat(index, { value: e.target.value })}
              />
            </Field>
            <Field label="Label">
              <Input
                value={row.label}
                onChange={(e) => updateStat(index, { label: e.target.value })}
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStat(index)}
                aria-label="Remove stat"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
