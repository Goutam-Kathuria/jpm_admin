import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getWebsiteContent,
  saveWebsiteContent,
} from "@/lib/websiteContentApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BlogPostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  visible: boolean;
};

type BlogsFormState = {
  visible: boolean;
  overline: string;
  heading: string;
  description: string;
  posts: BlogPostForm[];
};

const blogsQueryKey = ["admin", "website-content", "blogs"];

const defaultBlogPost: BlogPostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  authorName: "JPM Enterprises",
  publishedAt: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  featured: false,
  visible: true,
};

const defaultBlogsForm: BlogsFormState = {
  visible: true,
  overline: "Furniture Journal",
  heading: "Ideas that help your home feel beautifully lived in",
  description:
    "Publish SEO-focused blog posts that target search intent around sofas, furniture buying, upholstery, and interior styling.",
  posts: [],
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createEmptyBlogPost() {
  return { ...defaultBlogPost };
}

function normalizeBlogPost(raw: unknown): BlogPostForm {
  const post = raw && typeof raw === "object" ? raw : {};
  const tagsValue = Array.isArray((post as { tags?: unknown }).tags)
    ? (post as { tags: unknown[] }).tags
        .map((tag) => normalizeText(tag))
        .filter(Boolean)
        .join(", ")
    : normalizeText((post as { tags?: unknown }).tags);

  return {
    title: normalizeText((post as { title?: unknown }).title),
    slug: normalizeText((post as { slug?: unknown }).slug),
    excerpt: normalizeText((post as { excerpt?: unknown }).excerpt),
    content:
      normalizeText((post as { content?: unknown }).content) ||
      normalizeText((post as { body?: unknown }).body),
    coverImageUrl:
      normalizeText((post as { coverImageUrl?: unknown }).coverImageUrl) ||
      normalizeText((post as { image?: unknown }).image),
    authorName:
      normalizeText((post as { authorName?: unknown }).authorName) ||
      "JPM Enterprises",
    publishedAt: normalizeText((post as { publishedAt?: unknown }).publishedAt),
    tags: tagsValue,
    metaTitle: normalizeText((post as { metaTitle?: unknown }).metaTitle),
    metaDescription: normalizeText(
      (post as { metaDescription?: unknown }).metaDescription,
    ),
    featured: (post as { featured?: unknown }).featured === true,
    visible:
      (post as { visible?: unknown }).visible === false ? false : true,
  };
}

function normalizeBlogsForm(raw: unknown, visible = true): BlogsFormState {
  const data = raw && typeof raw === "object" ? raw : {};
  const posts = Array.isArray((data as { posts?: unknown }).posts)
    ? (data as { posts: unknown[] }).posts.map(normalizeBlogPost)
    : [];

  return {
    visible,
    overline:
      normalizeText((data as { overline?: unknown }).overline) ||
      defaultBlogsForm.overline,
    heading:
      normalizeText((data as { heading?: unknown }).heading) ||
      defaultBlogsForm.heading,
    description:
      normalizeText((data as { description?: unknown }).description) ||
      defaultBlogsForm.description,
    posts,
  };
}

function serializeBlogsForm(form: BlogsFormState) {
  return {
    overline: form.overline.trim(),
    heading: form.heading.trim(),
    description: form.description.trim(),
    posts: form.posts.map((post) => ({
      title: post.title.trim(),
      slug: post.slug.trim(),
      excerpt: post.excerpt.trim(),
      content: post.content.trim(),
      coverImageUrl: post.coverImageUrl.trim(),
      authorName: post.authorName.trim(),
      publishedAt: post.publishedAt.trim(),
      tags: post.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      metaTitle: post.metaTitle.trim(),
      metaDescription: post.metaDescription.trim(),
      featured: post.featured,
      visible: post.visible,
    })),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function BlogsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BlogsFormState>(defaultBlogsForm);

  const blogsQuery = useQuery({
    queryKey: blogsQueryKey,
    queryFn: () => getWebsiteContent("blogs"),
  });

  useEffect(() => {
    if (!blogsQuery.data) {
      return;
    }

    setForm(
      normalizeBlogsForm(blogsQuery.data.data, blogsQuery.data.visible ?? true),
    );
  }, [blogsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveWebsiteContent("blogs", {
        visible: form.visible,
        data: serializeBlogsForm(form),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: blogsQueryKey });
      toast.success("Blogs updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function updatePost(
    index: number,
    patch: Partial<BlogPostForm> | ((post: BlogPostForm) => BlogPostForm),
  ) {
    setForm((current) => ({
      ...current,
      posts: current.posts.map((post, postIndex) => {
        if (postIndex !== index) {
          return post;
        }

        return typeof patch === "function" ? patch(post) : { ...post, ...patch };
      }),
    }));
  }

  function addPost() {
    setForm((current) => ({
      ...current,
      posts: [...current.posts, createEmptyBlogPost()],
    }));
  }

  function removePost(index: number) {
    setForm((current) => ({
      ...current,
      posts: current.posts.filter((_, postIndex) => postIndex !== index),
    }));
  }

  const visiblePosts = form.posts.filter((post) => post.visible).length;
  const featuredPosts = form.posts.filter((post) => post.featured).length;

  return (
    <div>
      <PageHeader
        title="Blogs"
        subtitle="Manage SEO-focused articles for the public website."
        action={
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={addPost}>
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Blogs"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Badge variant="secondary">{form.posts.length} total posts</Badge>
        <Badge variant="secondary">{visiblePosts} visible</Badge>
        <Badge variant="secondary">{featuredPosts} featured</Badge>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Feed Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Show blog feed on website
              </p>
              <p className="text-xs text-muted-foreground">
                Controls whether the public blog feed is visible.
              </p>
            </div>
            <Switch
              checked={form.visible}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, visible: checked }))
              }
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blogs-overline">Overline</Label>
              <Input
                id="blogs-overline"
                value={form.overline}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    overline: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogs-heading">Heading</Label>
              <Input
                id="blogs-heading"
                value={form.heading}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    heading: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogs-description">Description</Label>
            <Textarea
              id="blogs-description"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {form.posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="font-medium text-foreground">No blog posts yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first article to start building searchable content for
                the website.
              </p>
              <Button type="button" variant="outline" className="mt-5" onClick={addPost}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Article
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {form.posts.map((post, index) => (
          <Card key={`blog-post-${index + 1}`}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{post.title || `Article ${index + 1}`}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Slug: {post.slug || "auto-from-title on website side"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePost(index)}
                aria-label="Remove article"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={post.title}
                    onChange={(event) =>
                      updatePost(index, { title: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={post.slug}
                    onChange={(event) =>
                      updatePost(index, { slug: event.target.value })
                    }
                    placeholder="optional-custom-slug"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={post.authorName}
                    onChange={(event) =>
                      updatePost(index, { authorName: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Published At</Label>
                  <Input
                    value={post.publishedAt}
                    onChange={(event) =>
                      updatePost(index, { publishedAt: event.target.value })
                    }
                    placeholder="2026-05-07"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input
                  value={post.coverImageUrl}
                  onChange={(event) =>
                    updatePost(index, { coverImageUrl: event.target.value })
                  }
                  placeholder="/assets/uploads/blog-cover.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  rows={3}
                  value={post.excerpt}
                  onChange={(event) =>
                    updatePost(index, { excerpt: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Article Content</Label>
                <Textarea
                  rows={8}
                  value={post.content}
                  onChange={(event) =>
                    updatePost(index, { content: event.target.value })
                  }
                  placeholder="Use blank lines to separate paragraphs."
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={post.tags}
                  onChange={(event) =>
                    updatePost(index, { tags: event.target.value })
                  }
                  placeholder="sofa care, upholstery, custom furniture"
                />
              </div>

              <Separator />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={post.metaTitle}
                    onChange={(event) =>
                      updatePost(index, { metaTitle: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    rows={3}
                    value={post.metaDescription}
                    onChange={(event) =>
                      updatePost(index, { metaDescription: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Visible on website
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hidden posts stay in the panel but won&apos;t render.
                    </p>
                  </div>
                  <Switch
                    checked={post.visible}
                    onCheckedChange={(checked) =>
                      updatePost(index, { visible: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Featured post
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Featured posts surface first on the website.
                    </p>
                  </div>
                  <Switch
                    checked={post.featured}
                    onCheckedChange={(checked) =>
                      updatePost(index, { featured: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
