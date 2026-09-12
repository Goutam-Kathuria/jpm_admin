import { TableSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  addBlog,
  deleteBlog,
  editBlog,
  getBlogs,
  type Blog,
  type SaveBlogInput,
} from "@/lib/blogsApi";
import { getWebsiteContent, saveWebsiteContent } from "@/lib/websiteContentApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";

type BlogPostForm = {
  id: string;
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

type BlogFeedFormState = {
  visible: boolean;
  overline: string;
  heading: string;
  description: string;
};

const blogsQueryKey = ["admin", "website-content", "blogs"];
const blogPostsQueryKey = ["admin", "blogs"];

const defaultBlogPost: BlogPostForm = {
  id: "",
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

const defaultBlogsForm: BlogFeedFormState = {
  visible: true,
  overline: "Furniture Journal",
  heading: "Ideas that help your home feel beautifully lived in",
  description:
    "Publish SEO-focused blog posts that target search intent around sofas, furniture buying, upholstery, and interior styling.",
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createEmptyBlogPost() {
  return { ...defaultBlogPost, id: crypto.randomUUID() };
}

function mapBlogToForm(post: Blog): BlogPostForm {
  return {
    id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    authorName: post.authorName || "JPM Enterprises",
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
    tags: post.tags.join(", "),
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    featured: post.featured,
    visible: post.visible,
  };
}

function normalizeBlogsForm(raw: unknown, visible = true): BlogFeedFormState {
  const data = raw && typeof raw === "object" ? raw : {};

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
  };
}

function serializeBlogsForm(form: BlogFeedFormState) {
  return {
    overline: form.overline.trim(),
    heading: form.heading.trim(),
    description: form.description.trim(),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function BlogsPage() {
  const queryClient = useQueryClient();
  const [feedForm, setFeedForm] = useState<BlogFeedFormState>({
    visible: defaultBlogsForm.visible,
    overline: defaultBlogsForm.overline,
    heading: defaultBlogsForm.heading,
    description: defaultBlogsForm.description,
  });
  const [posts, setPosts] = useState<BlogPostForm[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<BlogPostForm>(createEmptyBlogPost());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blogsQuery = useQuery({
    queryKey: blogsQueryKey,
    queryFn: () => getWebsiteContent("blogs"),
  });

  const blogPostsQuery = useQuery({
    queryKey: blogPostsQueryKey,
    queryFn: getBlogs,
  });

  useEffect(() => {
    if (!blogsQuery.data) {
      return;
    }

    const normalized = normalizeBlogsForm(blogsQuery.data.data, blogsQuery.data.visible ?? true);
    setFeedForm({
      visible: normalized.visible,
      overline: normalized.overline,
      heading: normalized.heading,
      description: normalized.description,
    });
  }, [blogsQuery.data]);

  useEffect(() => {
    if (blogPostsQuery.data) {
      setPosts(blogPostsQuery.data.map(mapBlogToForm));
    }
  }, [blogPostsQuery.data]);

  const [isSaving, setIsSaving] = useState(false);

  const visiblePosts = posts.filter((post) => post.visible).length;
  const featuredPosts = posts.filter((post) => post.featured).length;

  const editingPost = useMemo(() => {
    if (!editingId) return null;
    return posts.find((post) => post.id === editingId) ?? null;
  }, [editingId, posts]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function clearFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetPostForm() {
    setEditingId(null);
    setPostForm(createEmptyBlogPost());
    setImageFile(null);
    setImagePreview("");
    clearFileInput();
  }

  function openAdd() {
    resetPostForm();
    setModalOpen(true);
  }

  function openEdit(post: BlogPostForm) {
    setEditingId(post.id);
    setPostForm({ ...post });
    setImagePreview(post.coverImageUrl);
    setImageFile(null);
    clearFileInput();
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;
    setModalOpen(false);
    resetPostForm();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageFile(file);
    setPostForm((current) => ({ ...current, coverImageUrl: preview }));
  }

  const savePostMutation = useMutation({
    mutationFn: async (form: BlogPostForm) => {
      const input: SaveBlogInput = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImageUrl: imageFile ? "" : form.coverImageUrl.trim(),
        coverImage: imageFile,
        authorName: form.authorName.trim(),
        publishedAt: form.publishedAt.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        featured: form.featured,
        visible: form.visible,
      };

      return editingId ? editBlog(editingId, input) : addBlog(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: blogPostsQueryKey });
      setModalOpen(false);
      resetPostForm();
      toast.success(editingId ? "Blog updated" : "Blog added");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: blogPostsQueryKey });
      toast.success("Blog deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function handleSavePost() {
    const title = postForm.title.trim();
    if (!title) {
      toast.error("Blog title is required.");
      return;
    }

    savePostMutation.mutate({ ...postForm, title });
  }

  function handleDelete(id: string) {
    deletePostMutation.mutate(id);
  }

  function handleSaveAll() {
    const payload = serializeBlogsForm(feedForm);
    setIsSaving(true);
    void saveWebsiteContent("blogs", {
      visible: feedForm.visible,
      data: payload,
    })
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: blogsQueryKey });
        toast.success("Blog section updated");
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
        title="Blogs"
        subtitle="Manage SEO-focused articles for the public website."
        action={
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Blogs"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Badge variant="secondary">{posts.length} total posts</Badge>
        <Badge variant="secondary">{visiblePosts} visible</Badge>
        <Badge variant="secondary">{featuredPosts} featured</Badge>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blogs-overline">Overline</Label>
          <Input
            id="blogs-overline"
            value={feedForm.overline}
            onChange={(event) =>
              setFeedForm((current) => ({ ...current, overline: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blogs-heading">Heading</Label>
          <Input
            id="blogs-heading"
            value={feedForm.heading}
            onChange={(event) =>
              setFeedForm((current) => ({ ...current, heading: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="blogs-description">Description</Label>
          <Textarea
            id="blogs-description"
            rows={3}
            value={feedForm.description}
            onChange={(event) =>
              setFeedForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 md:col-span-2">
          <p className="text-sm font-medium text-foreground">Show blog feed on website</p>
          <Switch
            checked={feedForm.visible}
            onCheckedChange={(checked) =>
              setFeedForm((current) => ({ ...current, visible: checked }))
            }
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {blogsQuery.isLoading || blogPostsQuery.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No blog posts yet.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <p className="font-medium">{post.title || "Untitled Post"}</p>
                      <p className="text-xs text-muted-foreground">{post.slug || "slug auto-generated"}</p>
                    </TableCell>
                    <TableCell>{post.authorName || "JPM Enterprises"}</TableCell>
                    <TableCell>{post.publishedAt || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={post.visible ? "default" : "secondary"}>
                        {post.visible ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.featured ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPostForm(post);
                            setPreviewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingPost ? "Edit Blog" : "Add Blog"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button onClick={handleSavePost} disabled={savePostMutation.isPending}>
              {savePostMutation.isPending
                ? "Saving..."
                : editingPost
                  ? "Save Changes"
                  : "Add Blog"}
            </Button>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={postForm.title} onChange={(e) => setPostForm((c) => ({ ...c, title: e.target.value }))} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={postForm.slug} onChange={(e) => setPostForm((c) => ({ ...c, slug: e.target.value }))} placeholder="Auto-generated when empty" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Author</Label>
              <Input value={postForm.authorName} onChange={(e) => setPostForm((c) => ({ ...c, authorName: e.target.value }))} />
            </div>
            <div>
              <Label>Published Date</Label>
              <Input type="date" value={postForm.publishedAt} onChange={(e) => setPostForm((c) => ({ ...c, publishedAt: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Cover Image Upload</Label>
            <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview ? <img src={imagePreview} alt="Blog preview" className="mt-3 h-24 w-24 rounded-md object-cover" /> : null}
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea rows={3} value={postForm.excerpt} onChange={(e) => setPostForm((c) => ({ ...c, excerpt: e.target.value }))} />
          </div>
          <div>
            <Label>Article Content</Label>
            <ReactQuill theme="snow" value={postForm.content} onChange={(value) => setPostForm((c) => ({ ...c, content: value }))} />
          </div>
          <div>
            <Label>Tags</Label>
            <Input value={postForm.tags} onChange={(e) => setPostForm((c) => ({ ...c, tags: e.target.value }))} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Meta Title</Label>
              <Input value={postForm.metaTitle} onChange={(e) => setPostForm((c) => ({ ...c, metaTitle: e.target.value }))} />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea rows={3} value={postForm.metaDescription} onChange={(e) => setPostForm((c) => ({ ...c, metaDescription: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <Label>Visible</Label>
              <Switch checked={postForm.visible} onCheckedChange={(checked) => setPostForm((c) => ({ ...c, visible: checked }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <Label>Featured</Label>
              <Switch checked={postForm.featured} onCheckedChange={(checked) => setPostForm((c) => ({ ...c, featured: checked }))} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Blog Preview" size="lg">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">{postForm.title || "Untitled"}</h3>
          {postForm.coverImageUrl ? (
            <img src={postForm.coverImageUrl} alt={postForm.title} className="max-h-60 w-full rounded-md object-cover" />
          ) : null}
          <p className="text-sm text-muted-foreground">{postForm.excerpt}</p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: postForm.content || "<p>No content</p>" }} />
        </div>
      </Modal>
    </div>
  );
}
