import { resolveApiAssetUrl } from "@/api/apiClient";
import {
  HeroSectionLivePreview,
  OurStoryLivePreview,
  WhyChooseLivePreview,
} from "@/components/website-content/WebsiteSectionPreviews";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getWebsiteContent,
  saveWebsiteContent,
  type WebsiteContentRecord,
} from "@/lib/websiteContentApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Eye,
  ImageIcon,
  LayoutTemplate,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type SectionId = "hero" | "why_choose_us" | "our_story";

type HeroHighlight = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

type WhyChooseItem = {
  iconKey: string;
  title: string;
  description: string;
};

type StoryStat = {
  value: string;
  label: string;
};

type HeroFormState = {
  eyebrowText: string;
  headlineLine1: string;
  headlineAccent: string;
  subheading: string;
  caption: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  backgroundImageUrl: string;
  highlightsCardTitle: string;
  highlightsSubtitleDefault: string;
  deskHeading: string;
  deskPhone: string;
  deskEmail: string;
  highlights: HeroHighlight[];
};

type WhyFormState = {
  overline: string;
  heading: string;
  description: string;
  items: WhyChooseItem[];
};

type StoryFormState = {
  overline: string;
  headingLine1: string;
  headingAccent: string;
  paragraphs: string[];
  stats: StoryStat[];
  imageUrl: string;
};

type SectionEditorState<Form> = {
  visible: boolean;
  form: Form;
  pendingFiles: Record<string, File>;
  dirty: boolean;
};

const SECTIONS = [
  {
    id: "hero",
    label: "Home Hero",
    modelKey: "hero",
    saveLabel: "Save Home Hero",
    description:
      "Manage the homepage hero copy, background image, CTAs, and the collection highlights card.",
  },
  {
    id: "why_choose_us",
    label: "Why Choose Us",
    modelKey: "why_choose_us",
    saveLabel: "Save Why Choose Us",
    description:
      "Control the trust-building section cards that explain the JPM difference on the homepage.",
  },
  {
    id: "our_story",
    label: "Our Story",
    modelKey: "our_story",
    saveLabel: "Save Our Story",
    description:
      "Edit the brand story, stats, and supporting craftsmanship image shown on the website.",
  },
] as const;

const heroDefaults: HeroFormState = {
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

const whyDefaults: WhyFormState = {
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

const storyDefaults: StoryFormState = {
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

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: unknown,
): T {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return base;
  }

  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    if (value === undefined) {
      continue;
    }
    out[key] = value;
  }

  return out as T;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function normalizeHeroData(raw: unknown): HeroFormState {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const merged = deepMerge(
    heroDefaults as unknown as Record<string, unknown>,
    patch,
  );

  const rawHighlights = Array.isArray(
    (merged as { highlights?: unknown }).highlights,
  )
    ? ([...(merged as { highlights: unknown[] }).highlights] as Record<
        string,
        unknown
      >[])
    : [...heroDefaults.highlights];

  const highlights = rawHighlights.slice(0, 8).map((row, index) => {
    const fallback =
      heroDefaults.highlights[index] ?? heroDefaults.highlights[0];

    return {
      title: String(row.title ?? fallback.title),
      subtitle: String(
        row.subtitle ??
          fallback.subtitle ??
          heroDefaults.highlightsSubtitleDefault,
      ),
      imageUrl: String(row.imageUrl ?? ""),
    };
  });

  return {
    ...heroDefaults,
    ...merged,
    backgroundImageUrl: String(merged.backgroundImageUrl ?? heroDefaults.backgroundImageUrl),
    highlightsCardTitle: String(
      merged.highlightsCardTitle ?? heroDefaults.highlightsCardTitle,
    ),
    highlightsSubtitleDefault: String(
      merged.highlightsSubtitleDefault ?? heroDefaults.highlightsSubtitleDefault,
    ),
    deskHeading: String(merged.deskHeading ?? heroDefaults.deskHeading),
    deskPhone: String(merged.deskPhone ?? ""),
    deskEmail: String(merged.deskEmail ?? ""),
    highlights,
  };
}

function normalizeWhyData(raw: unknown): WhyFormState {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const merged = deepMerge(
    whyDefaults as unknown as Record<string, unknown>,
    patch,
  );

  const rawItems = Array.isArray((merged as { items?: unknown }).items)
    ? ([...(merged as { items: unknown[] }).items] as Record<string, unknown>[])
    : [...whyDefaults.items];

  const items = rawItems.slice(0, 12).map((row, index) => {
    const fallback = whyDefaults.items[index] ?? whyDefaults.items[0];

    return {
      iconKey: String(row.iconKey ?? fallback.iconKey),
      title: String(row.title ?? fallback.title),
      description: String(row.description ?? fallback.description),
    };
  });

  return {
    ...whyDefaults,
    ...merged,
    overline: String(merged.overline ?? whyDefaults.overline),
    heading: String(merged.heading ?? whyDefaults.heading),
    description: String(merged.description ?? whyDefaults.description),
    items,
  };
}

function normalizeStoryData(raw: unknown): StoryFormState {
  const patch = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const merged = deepMerge(
    storyDefaults as unknown as Record<string, unknown>,
    patch,
  );

  const rawParagraphs = Array.isArray(
    (merged as { paragraphs?: unknown }).paragraphs,
  )
    ? (merged as { paragraphs: unknown[] }).paragraphs.map((paragraph) =>
        String(paragraph),
      )
    : [...storyDefaults.paragraphs];

  const paragraphs = rawParagraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const rawStats = Array.isArray((merged as { stats?: unknown }).stats)
    ? ([...(merged as { stats: unknown[] }).stats] as Record<string, unknown>[])
    : [...storyDefaults.stats];

  const stats = rawStats.slice(0, 8).map((row, index) => {
    const fallback = storyDefaults.stats[index] ?? storyDefaults.stats[0];
    return {
      value: String(row.value ?? fallback.value),
      label: String(row.label ?? fallback.label),
    };
  });

  return {
    ...storyDefaults,
    ...merged,
    overline: String(merged.overline ?? storyDefaults.overline),
    headingLine1: String(merged.headingLine1 ?? storyDefaults.headingLine1),
    headingAccent: String(merged.headingAccent ?? storyDefaults.headingAccent),
    paragraphs: paragraphs.length ? paragraphs : [...storyDefaults.paragraphs],
    stats,
    imageUrl: String(merged.imageUrl ?? storyDefaults.imageUrl),
  };
}

function createSectionState<Form>(
  form: Form,
  visible = true,
): SectionEditorState<Form> {
  return {
    visible,
    form,
    pendingFiles: {},
    dirty: false,
  };
}

function createHeroEditorState(record: WebsiteContentRecord | null) {
  return createSectionState(
    normalizeHeroData(record?.data),
    record?.visible ?? true,
  );
}

function createWhyEditorState(record: WebsiteContentRecord | null) {
  return createSectionState(
    normalizeWhyData(record?.data),
    record?.visible ?? true,
  );
}

function createStoryEditorState(record: WebsiteContentRecord | null) {
  return createSectionState(
    normalizeStoryData(record?.data),
    record?.visible ?? true,
  );
}

function contentQueryKey(modelKey: string) {
  return ["admin", "website-content", modelKey] as const;
}

function getSectionById(sectionId: SectionId) {
  return SECTIONS.find((section) => section.id === sectionId) ?? SECTIONS[0];
}

function getImageName(value: string) {
  if (!value) {
    return "";
  }

  if (value.startsWith("blob:")) {
    return "Local preview";
  }

  if (value.startsWith("data:")) {
    return "Pasted image";
  }

  return value.split("/").filter(Boolean).pop() ?? value;
}

function resolvePreviewImage(value: string) {
  return value ? resolveApiAssetUrl(value) : "";
}

export function WebsiteContentPage() {
  const queryClient = useQueryClient();
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<SectionId>("hero");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [heroState, setHeroState] = useState(() =>
    createSectionState(deepClone(heroDefaults)),
  );
  const [whyState, setWhyState] = useState(() =>
    createSectionState(deepClone(whyDefaults)),
  );
  const [storyState, setStoryState] = useState(() =>
    createSectionState(deepClone(storyDefaults)),
  );

  const activeSection = useMemo(() => getSectionById(activeTab), [activeTab]);

  const contentQuery = useQuery({
    queryKey: contentQueryKey(activeSection.modelKey),
    queryFn: () => getWebsiteContent(activeSection.modelKey),
  });

  const revokeObjectUrl = useCallback((value?: string) => {
    if (!value?.startsWith("blob:")) {
      return;
    }

    URL.revokeObjectURL(value);
    objectUrlsRef.current.delete(value);
  }, []);

  const createObjectPreview = useCallback(
    (file: File, previousValue?: string) => {
      revokeObjectUrl(previousValue);
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      return objectUrl;
    },
    [revokeObjectUrl],
  );

  const revokeHeroPreviewUrls = useCallback(
    (form: HeroFormState) => {
      revokeObjectUrl(form.backgroundImageUrl);
    },
    [revokeObjectUrl],
  );

  const revokeStoryPreviewUrls = useCallback(
    (form: StoryFormState) => {
      revokeObjectUrl(form.imageUrl);
    },
    [revokeObjectUrl],
  );

  useEffect(() => {
    return () => {
      for (const objectUrl of objectUrlsRef.current) {
        URL.revokeObjectURL(objectUrl);
      }
      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (contentQuery.isLoading || contentQuery.isError) {
      return;
    }

    const record = contentQuery.data ?? null;

    if (activeTab === "hero") {
      setHeroState((previous) => {
        if (previous.dirty) {
          return previous;
        }

        revokeHeroPreviewUrls(previous.form);
        return createHeroEditorState(record);
      });
      return;
    }

    if (activeTab === "why_choose_us") {
      setWhyState((previous) =>
        previous.dirty ? previous : createWhyEditorState(record),
      );
      return;
    }

    setStoryState((previous) => {
      if (previous.dirty) {
        return previous;
      }

      revokeStoryPreviewUrls(previous.form);
      return createStoryEditorState(record);
    });
  }, [
    activeTab,
    contentQuery.data,
    contentQuery.isError,
    contentQuery.isLoading,
    revokeHeroPreviewUrls,
    revokeStoryPreviewUrls,
  ]);

  const saveMutation = useMutation({
    mutationFn: async (sectionId: SectionId) => {
      if (sectionId === "hero") {
        const { highlightsSubtitleDefault: _omit, ...heroPayload } = heroState.form;
        return saveWebsiteContent("hero", {
          visible: heroState.visible,
          data: deepClone(heroPayload) as Record<string, unknown>,
          files: heroState.pendingFiles,
        });
      }

      if (sectionId === "why_choose_us") {
        return saveWebsiteContent("why_choose_us", {
          visible: whyState.visible,
          data: deepClone(whyState.form) as Record<string, unknown>,
          files: whyState.pendingFiles,
        });
      }

      return saveWebsiteContent("our_story", {
        visible: storyState.visible,
        data: deepClone(storyState.form) as Record<string, unknown>,
        files: storyState.pendingFiles,
      });
    },
    onSuccess: (saved, sectionId) => {
      const savedRecord = saved ?? null;
      const section = getSectionById(sectionId);

      if (savedRecord) {
        queryClient.setQueryData(contentQueryKey(section.modelKey), savedRecord);
      }

      if (sectionId === "hero") {
        setHeroState((previous) => {
          revokeHeroPreviewUrls(previous.form);
          return createHeroEditorState(savedRecord);
        });
      } else if (sectionId === "why_choose_us") {
        setWhyState(createWhyEditorState(savedRecord));
      } else {
        setStoryState((previous) => {
          revokeStoryPreviewUrls(previous.form);
          return createStoryEditorState(savedRecord);
        });
      }

      void queryClient.invalidateQueries({
        queryKey: contentQueryKey(section.modelKey),
      });

      toast.success(`${section.label} saved successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const activeState = useMemo(() => {
    if (activeTab === "hero") {
      return heroState;
    }
    if (activeTab === "why_choose_us") {
      return whyState;
    }
    return storyState;
  }, [activeTab, heroState, storyState, whyState]);

  const sectionSummary = useMemo(() => {
    if (activeTab === "hero") {
      return `${heroState.form.highlights.length} highlight rows`;
    }
    if (activeTab === "why_choose_us") {
      return `${whyState.form.items.length} feature cards`;
    }
    return `${storyState.form.stats.length} stat blocks`;
  }, [activeTab, heroState.form.highlights.length, storyState.form.stats.length, whyState.form.items.length]);

  const updateHeroForm = useCallback(
    (updater: (previous: HeroFormState) => HeroFormState) => {
      setHeroState((previous) => ({
        ...previous,
        dirty: true,
        form: updater(previous.form),
      }));
    },
    [],
  );

  const updateWhyForm = useCallback(
    (updater: (previous: WhyFormState) => WhyFormState) => {
      setWhyState((previous) => ({
        ...previous,
        dirty: true,
        form: updater(previous.form),
      }));
    },
    [],
  );

  const updateStoryForm = useCallback(
    (updater: (previous: StoryFormState) => StoryFormState) => {
      setStoryState((previous) => ({
        ...previous,
        dirty: true,
        form: updater(previous.form),
      }));
    },
    [],
  );

  const setSectionVisible = useCallback((sectionId: SectionId, visible: boolean) => {
    if (sectionId === "hero") {
      setHeroState((previous) => ({ ...previous, visible, dirty: true }));
      return;
    }

    if (sectionId === "why_choose_us") {
      setWhyState((previous) => ({ ...previous, visible, dirty: true }));
      return;
    }

    setStoryState((previous) => ({ ...previous, visible, dirty: true }));
  }, []);

  const selectHeroBackgroundImage = useCallback(
    (file: File) => {
      setHeroState((previous) => ({
        ...previous,
        dirty: true,
        pendingFiles: {
          ...previous.pendingFiles,
          backgroundImageUrl: file,
        },
        form: {
          ...previous.form,
          backgroundImageUrl: createObjectPreview(
            file,
            previous.form.backgroundImageUrl,
          ),
        },
      }));
    },
    [createObjectPreview],
  );

  const selectStoryImage = useCallback(
    (file: File) => {
      setStoryState((previous) => ({
        ...previous,
        dirty: true,
        pendingFiles: {
          ...previous.pendingFiles,
          imageUrl: file,
        },
        form: {
          ...previous.form,
          imageUrl: createObjectPreview(file, previous.form.imageUrl),
        },
      }));
    },
    [createObjectPreview],
  );

  const previewContent = useMemo(() => {
    if (activeTab === "hero") {
      return <HeroSectionLivePreview data={heroState.form} />;
    }

    if (activeTab === "why_choose_us") {
      return <WhyChooseLivePreview data={whyState.form} />;
    }

    return <OurStoryLivePreview data={storyState.form} />;
  }, [activeTab, heroState.form, storyState.form, whyState.form]);

  const isSavingActiveSection =
    saveMutation.isPending && saveMutation.variables === activeTab;

  return (
    <div data-ocid="website-content.page" className="space-y-6">
      <PageHeader
        title="Website Content"
        subtitle="Manage the homepage CMS sections with the same preview-first workflow used in the reference admin."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="rounded-xl gap-2 shadow-sm w-full sm:w-auto"
            >
              <Eye size={15} />
              Preview
            </Button>
            <Button
              type="button"
              onClick={() => saveMutation.mutate(activeTab)}
              disabled={isSavingActiveSection}
              className="rounded-xl gap-2 shadow-sm w-full sm:w-auto"
            >
              {isSavingActiveSection ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {isSavingActiveSection ? "Saving..." : activeSection.saveLabel}
            </Button>
          </div>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SectionId)}
        className="mb-6"
      >
        <TabsList className="inline-flex w-full rounded-3xl bg-slate-100 p-2 gap-2 h-auto">
          {SECTIONS.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex-1 rounded-2xl"
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {contentQuery.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(contentQuery.error)}
        </div>
      ) : null}

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-[#1E293B]">
                <LayoutTemplate size={18} />
                {activeSection.label}
              </CardTitle>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {activeSection.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono text-[11px]">
                modelKey: {activeSection.modelKey}
              </Badge>
              <Badge variant={activeState.visible ? "secondary" : "outline"}>
                {activeState.visible ? "Visible on site" : "Hidden on site"}
              </Badge>
              {activeState.dirty ? (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-800"
                >
                  Unsaved changes
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Synced
                </Badge>
              )}
              {contentQuery.isFetching ? (
                <Badge variant="outline">Refreshing...</Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`visible-${activeTab}`} className="text-sm">
                    Section visibility
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, the public API returns 404 for this section
                    and the website falls back to its built-in copy.
                  </p>
                </div>
                <Switch
                  id={`visible-${activeTab}`}
                  checked={activeState.visible}
                  onCheckedChange={(checked) =>
                    setSectionVisible(activeTab, checked)
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Section payload
              </p>
              <p className="mt-2 text-sm text-foreground">{sectionSummary}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Preview uses the live website styling before you publish.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {activeTab === "hero" ? (
            <HeroEditor
              form={heroState.form}
              pendingFiles={heroState.pendingFiles}
              onChange={updateHeroForm}
              onSelectBackgroundImage={selectHeroBackgroundImage}
            />
          ) : null}

          {activeTab === "why_choose_us" ? (
            <WhyChooseEditor form={whyState.form} onChange={updateWhyForm} />
          ) : null}

          {activeTab === "our_story" ? (
            <StoryEditor
              form={storyState.form}
              pendingFiles={storyState.pendingFiles}
              onChange={updateStoryForm}
              onSelectImage={selectStoryImage}
            />
          ) : null}
        </CardContent>
      </Card>

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
              Styled like the live website. This preview uses the current form
              values, including unsaved image selections.
              {!activeState.visible ? (
                <Badge variant="outline" className="text-xs">
                  Visibility off: hidden on public GET
                </Badge>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-[1100px] space-y-4">
              <Badge variant="secondary" className="font-mono text-[11px]">
                modelKey: {activeSection.modelKey}
              </Badge>
              {previewContent}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeroEditor({
  form,
  pendingFiles,
  onChange,
  onSelectBackgroundImage,
}: {
  form: HeroFormState;
  pendingFiles: Record<string, File>;
  onChange: (updater: (previous: HeroFormState) => HeroFormState) => void;
  onSelectBackgroundImage: (file: File) => void;
}) {
  const update = (patch: Partial<HeroFormState>) => {
    onChange((previous) => ({ ...previous, ...patch }));
  };

  const updateHighlight = (index: number, patch: Partial<HeroHighlight>) => {
    onChange((previous) => ({
      ...previous,
      highlights: previous.highlights.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const addHighlight = () => {
    onChange((previous) => ({
      ...previous,
      highlights: [
        ...previous.highlights,
        {
          title: "",
          subtitle: previous.highlightsSubtitleDefault,
          imageUrl: "",
        },
      ],
    }));
  };

  const removeHighlight = (index: number) => {
    onChange((previous) => ({
      ...previous,
      highlights: previous.highlights.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Field label="Eyebrow Text">
          <Input
            value={form.eyebrowText}
            onChange={(event) => update({ eyebrowText: event.target.value })}
          />
        </Field>

        <ImageUploadField
          id="hero-background-image"
          label="Background Image"
          hint="Used behind the homepage hero copy."
          value={form.backgroundImageUrl}
          pending={Boolean(pendingFiles.backgroundImageUrl)}
          onPick={onSelectBackgroundImage}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Headline (first line)">
          <Input
            value={form.headlineLine1}
            onChange={(event) => update({ headlineLine1: event.target.value })}
          />
        </Field>
        <Field label="Headline Accent">
          <Input
            value={form.headlineAccent}
            onChange={(event) => update({ headlineAccent: event.target.value })}
          />
        </Field>
      </div>

      <Field label="Subheading">
        <Textarea
          rows={4}
          value={form.subheading}
          onChange={(event) => update({ subheading: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Primary CTA Label">
          <Input
            value={form.primaryCtaLabel}
            onChange={(event) =>
              update({ primaryCtaLabel: event.target.value })
            }
          />
        </Field>
        <Field label="Secondary CTA Label">
          <Input
            value={form.secondaryCtaLabel}
            onChange={(event) =>
              update({ secondaryCtaLabel: event.target.value })
            }
          />
        </Field>
      </div>

      <Field label="Bottom Caption">
        <Textarea
          rows={3}
          value={form.caption}
          onChange={(event) => update({ caption: event.target.value })}
        />
      </Field>

      <Separator />

      <Field label="Highlights Card Title">
        <Input
          value={form.highlightsCardTitle}
          onChange={(event) =>
            update({ highlightsCardTitle: event.target.value })
          }
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Highlight Rows</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={addHighlight}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add row
          </Button>
        </div>

        {form.highlights.map((row, index) => (
          <div
            key={`hero-highlight-${index}`}
            className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[1fr_1fr_1.3fr_auto]"
          >
            <Field label="Title">
              <Input
                value={row.title}
                onChange={(event) =>
                  updateHighlight(index, { title: event.target.value })
                }
              />
            </Field>

            <Field label="Subtitle">
              <Input
                value={row.subtitle}
                onChange={(event) =>
                  updateHighlight(index, { subtitle: event.target.value })
                }
              />
            </Field>

            <Field label="Image URL (optional)">
              <Input
                value={row.imageUrl}
                onChange={(event) =>
                  updateHighlight(index, { imageUrl: event.target.value })
                }
                placeholder="/assets/uploads/..."
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeHighlight(index)}
                aria-label="Remove highlight row"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <Field label="Design Desk Heading">
        <Input
          value={form.deskHeading}
          onChange={(event) => update({ deskHeading: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Desk Phone Override">
          <Input
            value={form.deskPhone}
            onChange={(event) => update({ deskPhone: event.target.value })}
            placeholder="Uses site settings when empty"
          />
        </Field>
        <Field label="Desk Email Override">
          <Input
            value={form.deskEmail}
            type="email"
            onChange={(event) => update({ deskEmail: event.target.value })}
            placeholder="Uses site settings when empty"
          />
        </Field>
      </div>
    </div>
  );
}

function WhyChooseEditor({
  form,
  onChange,
}: {
  form: WhyFormState;
  onChange: (updater: (previous: WhyFormState) => WhyFormState) => void;
}) {
  const update = (patch: Partial<WhyFormState>) => {
    onChange((previous) => ({ ...previous, ...patch }));
  };

  const updateItem = (index: number, patch: Partial<WhyChooseItem>) => {
    onChange((previous) => ({
      ...previous,
      items: previous.items.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const addItem = () => {
    onChange((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        { iconKey: "gem", title: "", description: "" },
      ],
    }));
  };

  const removeItem = (index: number) => {
    onChange((previous) => ({
      ...previous,
      items: previous.items.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <Field label="Overline">
        <Input
          value={form.overline}
          onChange={(event) => update({ overline: event.target.value })}
        />
      </Field>

      <Field label="Heading">
        <Input
          value={form.heading}
          onChange={(event) => update({ heading: event.target.value })}
        />
      </Field>

      <Field label="Description">
        <Textarea
          rows={4}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
        />
      </Field>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Feature Cards</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={addItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add card
          </Button>
        </div>

        {form.items.map((row, index) => (
          <div
            key={`why-card-${index}`}
            className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[180px_1fr_1.8fr_auto]"
          >
            <Field label="Icon">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={row.iconKey}
                onChange={(event) =>
                  updateItem(index, { iconKey: event.target.value })
                }
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title">
              <Input
                value={row.title}
                onChange={(event) =>
                  updateItem(index, { title: event.target.value })
                }
              />
            </Field>

            <Field label="Description">
              <Textarea
                rows={2}
                value={row.description}
                onChange={(event) =>
                  updateItem(index, { description: event.target.value })
                }
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
                aria-label="Remove feature card"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryEditor({
  form,
  pendingFiles,
  onChange,
  onSelectImage,
}: {
  form: StoryFormState;
  pendingFiles: Record<string, File>;
  onChange: (updater: (previous: StoryFormState) => StoryFormState) => void;
  onSelectImage: (file: File) => void;
}) {
  const update = (patch: Partial<StoryFormState>) => {
    onChange((previous) => ({ ...previous, ...patch }));
  };

  const updateStat = (index: number, patch: Partial<StoryStat>) => {
    onChange((previous) => ({
      ...previous,
      stats: previous.stats.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const addStat = () => {
    onChange((previous) => ({
      ...previous,
      stats: [...previous.stats, { value: "", label: "" }],
    }));
  };

  const removeStat = (index: number) => {
    onChange((previous) => ({
      ...previous,
      stats: previous.stats.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const paragraphsText = form.paragraphs.join("\n\n");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Field label="Overline">
          <Input
            value={form.overline}
            onChange={(event) => update({ overline: event.target.value })}
          />
        </Field>

        <ImageUploadField
          id="story-image"
          label="Story Image"
          hint="Shown alongside the craftsmanship story on the homepage."
          value={form.imageUrl}
          pending={Boolean(pendingFiles.imageUrl)}
          onPick={onSelectImage}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Heading (first line)">
          <Input
            value={form.headingLine1}
            onChange={(event) => update({ headingLine1: event.target.value })}
          />
        </Field>
        <Field label="Heading Accent">
          <Input
            value={form.headingAccent}
            onChange={(event) => update({ headingAccent: event.target.value })}
          />
        </Field>
      </div>

      <Field label="Body Paragraphs">
        <Textarea
          rows={9}
          value={paragraphsText}
          onChange={(event) => {
            const paragraphs = event.target.value
              .split(/\n\s*\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean);

            update({
              paragraphs: paragraphs.length
                ? paragraphs
                : [event.target.value.trim()].filter(Boolean),
            });
          }}
          placeholder="Use a blank line to separate paragraphs."
        />
      </Field>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Stats</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={addStat}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add stat
          </Button>
        </div>

        {form.stats.map((row, index) => (
          <div
            key={`story-stat-${index}`}
            className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[1fr_1.5fr_auto]"
          >
            <Field label="Value">
              <Input
                value={row.value}
                onChange={(event) =>
                  updateStat(index, { value: event.target.value })
                }
              />
            </Field>

            <Field label="Label">
              <Input
                value={row.label}
                onChange={(event) =>
                  updateStat(index, { label: event.target.value })
                }
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeStat(index)}
                aria-label="Remove stat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageUploadField({
  id,
  label,
  hint,
  value,
  pending,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  pending: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewSrc = resolvePreviewImage(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {pending ? (
          <Badge variant="secondary" className="gap-1">
            <BadgeCheck className="h-3 w-3" />
            Ready to save
          </Badge>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] px-4 py-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary shrink-0">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={label}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1E293B]">
              {previewSrc ? "Replace image" : "Upload image"}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">{hint}</p>
            {value ? (
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {getImageName(value)}
              </p>
            ) : null}
          </div>

          <div className="ml-auto hidden h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm sm:flex">
            <Upload size={16} />
          </div>
        </div>
      </button>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPick(file);
          }
          event.currentTarget.value = "";
        }}
      />

      {previewSrc ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img
            src={previewSrc}
            alt={label}
            className="h-48 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
