import { TableSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getWebsiteContent, saveWebsiteContent } from "@/lib/websiteContentApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";

type CmsPage = {
  id: string;
  slug: "about-us" | "contact-us" | "privacy-policy";
  title: string;
  content: string;
  active: boolean;
  showInFooter: boolean;
};

const cmsQueryKey = ["admin", "website-content", "cms-pages"];

const defaultPages: CmsPage[] = [
  { id: "about-us", slug: "about-us", title: "About Us", content: "", active: true, showInFooter: true },
  { id: "contact-us", slug: "contact-us", title: "Contact Us", content: "", active: true, showInFooter: true },
  { id: "privacy-policy", slug: "privacy-policy", title: "Privacy Policy", content: "", active: true, showInFooter: true },
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePages(raw: unknown): CmsPage[] {
  const data = raw && typeof raw === "object" ? raw : {};
  const pages = Array.isArray((data as { pages?: unknown[] }).pages)
    ? (data as { pages: unknown[] }).pages
    : [];
  const mapped = pages.map((item) => {
    const page = item && typeof item === "object" ? item : {};
    const slug = normalizeText((page as { slug?: unknown }).slug) as CmsPage["slug"];
    return {
      id: slug || crypto.randomUUID(),
      slug,
      title: normalizeText((page as { title?: unknown }).title),
      content: normalizeText((page as { content?: unknown }).content),
      active: (page as { active?: unknown }).active !== false,
      showInFooter: (page as { showInFooter?: unknown }).showInFooter !== false,
    };
  });

  return defaultPages.map((requiredPage) => {
    const existing = mapped.find((page) => page.slug === requiredPage.slug);
    return existing ? { ...requiredPage, ...existing } : requiredPage;
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function CmsPagesPage() {
  const queryClient = useQueryClient();
  const [pages, setPages] = useState<CmsPage[]>(defaultPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CmsPage>(defaultPages[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const cmsQuery = useQuery({
    queryKey: cmsQueryKey,
    queryFn: () => getWebsiteContent("cms_pages"),
  });

  useEffect(() => {
    if (!cmsQuery.data) return;
    setPages(normalizePages(cmsQuery.data.data));
  }, [cmsQuery.data]);

  const editingPage = useMemo(
    () => (editingId ? pages.find((page) => page.id === editingId) ?? null : null),
    [editingId, pages],
  );

  function openAdd() {
    const usedSlugs = new Set(pages.map((page) => page.slug));
    const nextSlug =
      (defaultPages.find((page) => !usedSlugs.has(page.slug))?.slug ??
        "about-us") as CmsPage["slug"];
    setEditingId(null);
    const starter = defaultPages.find((page) => page.slug === nextSlug) ?? defaultPages[0];
    setForm({ ...starter, id: starter.slug });
    setIsModalOpen(true);
  }

  function openEdit(page: CmsPage) {
    setEditingId(page.id);
    setForm(page);
    setIsModalOpen(true);
  }

  function saveLocalPage() {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!form.slug) {
      toast.error("Slug is required.");
      return;
    }

    setPages((current) => {
      if (editingId) {
        return current.map((page) => (page.id === editingId ? form : page));
      }
      const alreadyExists = current.some((page) => page.slug === form.slug);
      if (alreadyExists) {
        toast.error("This page already exists. Please edit it from the table.");
        return current;
      }
      return [...current, { ...form, id: form.slug }];
    });
    setIsModalOpen(false);
    setEditingId(null);
  }

  function saveAllPages() {
    setIsSaving(true);
    void saveWebsiteContent("cms_pages", {
      visible: true,
      data: {
        pages: pages.map((page) => ({
          slug: page.slug,
          title: page.title.trim(),
          content: page.content,
          active: page.active,
          showInFooter: page.showInFooter,
        })),
      },
    })
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: cmsQueryKey });
        toast.success("CMS pages updated.");
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        subtitle="Manage About Us, Contact Us and Privacy Policy pages."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
            <Button onClick={saveAllPages} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save CMS Pages"}
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <Badge variant="secondary">{pages.length} pages</Badge>
        <Badge variant="secondary">
          {pages.filter((page) => page.active).length} active
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {cmsQuery.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={4} columns={5} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Website Status</TableHead>
                <TableHead>Footer Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.active ? "default" : "secondary"}>
                      {page.active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.showInFooter ? "default" : "secondary"}>
                      {page.showInFooter ? "Shown" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(page)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setForm(page);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPage ? "Edit CMS Page" : "Add CMS Page"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button onClick={saveLocalPage}>
              {editingPage ? "Save Changes" : "Add Page"}
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            {editingPage ? (
              <Input value={form.slug} disabled />
            ) : (
              <Select
                value={form.slug}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    slug: value as CmsPage["slug"],
                    id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select page slug" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="about-us">about-us</SelectItem>
                  <SelectItem value="contact-us">contact-us</SelectItem>
                  <SelectItem value="privacy-policy">privacy-policy</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Page Content</Label>
            <ReactQuill theme="snow" value={form.content} onChange={(value) => setForm((current) => ({ ...current, content: value }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <Label>Active on Website</Label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <Label>Show in Footer</Label>
              <Switch checked={form.showInFooter} onCheckedChange={(checked) => setForm((current) => ({ ...current, showInFooter: checked }))} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Page Preview" size="lg">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">{form.title || "Untitled Page"}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.content || "<p>No content</p>" }} />
        </div>
      </Modal>
    </div>
  );
}
