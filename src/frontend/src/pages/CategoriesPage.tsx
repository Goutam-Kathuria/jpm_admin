import { TableSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type Category,
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "@/lib/categoriesApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  order: string;
}

const emptyForm: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  isActive: true,
  order: "0",
};
const categoriesQueryKey = ["admin", "categories"];

function buildCategoryFormData(
  form: CategoryFormValues,
  selectedImageFile: File | null,
) {
  const formData = new FormData();
  formData.append("name", form.name.trim());
  formData.append("slug", form.slug.trim());
  formData.append("description", form.description.trim());
  formData.append(
    "tags",
    JSON.stringify(
      form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
  formData.append("metaTitle", form.metaTitle.trim());
  formData.append("metaDescription", form.metaDescription.trim());
  formData.append("isActive", String(form.isActive));
  formData.append("order", form.order.trim() || "0");

  if (selectedImageFile) {
    formData.append("image", selectedImageFile);
  }

  return formData;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormValues>(emptyForm);
  const [preview, setPreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: getCategories,
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id?: string;
      formData: FormData;
    }) => {
      if (id) {
        return editCategory(id, formData);
      }

      return addCategory(formData);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPreview("");
      setSelectedImageFile(null);
      clearFileInput();
      toast.success(variables.id ? "Category updated" : "Category added");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setDeleteId(null);
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const categories = categoriesQuery.data ?? [];
  const isSaving = saveCategoryMutation.isPending;
  const isDeleting = deleteCategoryMutation.isPending;

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function clearFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
    setSelectedImageFile(null);
    clearFileInput();
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug ?? "",
      description: category.description ?? "",
      tags: (category.tags ?? []).join(", "),
      metaTitle: category.metaTitle ?? "",
      metaDescription: category.metaDescription ?? "",
      isActive: category.isActive ?? true,
      order: String(category.order ?? 0),
    });
    setPreview(category.image);
    setSelectedImageFile(null);
    clearFileInput();
    setModalOpen(true);
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    setModalOpen(false);
    resetForm();
  }

  function handleDeleteClose() {
    if (isDeleting) {
      return;
    }

    setDeleteId(null);
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    const name = form.name.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    saveCategoryMutation.mutate({
      id: editing?._id,
      formData: buildCategoryFormData(
        {
          ...form,
          name,
        },
        selectedImageFile,
      ),
    });
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteCategoryMutation.mutate(deleteId);
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage your product categories"
        action={
          <Button onClick={openAdd} data-ocid="add-category">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        {categoriesQuery.isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16 text-muted-foreground font-medium">
                  Image
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Category
                </TableHead>
                <TableHead className="w-28 text-muted-foreground font-medium">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right text-muted-foreground font-medium">
                  Order
                </TableHead>
                <TableHead className="w-28 text-right text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesQuery.isError && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        {getErrorMessage(categoriesQuery.error)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => categoriesQuery.refetch()}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!categoriesQuery.isError && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3"
                      data-ocid="categories-empty-state"
                    >
                      <FolderOpen className="w-10 h-10 opacity-30" />
                      <p className="text-sm">
                        No categories yet. Add one to get started.
                      </p>
                      <Button variant="outline" size="sm" onClick={openAdd}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {categories.map((category) => (
                <TableRow
                  key={category._id}
                  className="border-border hover:bg-muted/40 transition-colors duration-150"
                  data-ocid="category-row"
                >
                  <TableCell>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 rounded-md object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.slug || "Slug will be generated automatically"}
                      </p>
                      {category.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {category.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-medium text-foreground tabular-nums">
                    {category.order ?? 0}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-accent/50 hover:text-accent-foreground"
                        onClick={() => openEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        data-ocid="edit-category"
                        disabled={isSaving || isDeleting}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(category._id)}
                        aria-label={`Delete ${category.name}`}
                        data-ocid="delete-category"
                        disabled={isSaving || isDeleting}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        open={modalOpen}
        onClose={handleClose}
        title={editing ? "Edit Category" : "Add Category"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              data-ocid="save-category"
              disabled={isSaving}
            >
              {isSaving
                ? editing
                  ? "Saving..."
                  : "Adding..."
                : editing
                  ? "Save Changes"
                  : "Add Category"}
            </Button>
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label htmlFor="cat-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Seating"
              className="mt-1"
              data-ocid="category-name-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    slug: e.target.value,
                  }))
                }
                placeholder="optional-custom-slug"
                className="mt-1"
                data-ocid="category-slug-input"
              />
            </div>

            <div>
              <Label htmlFor="cat-order">Sort Order</Label>
              <Input
                id="cat-order"
                type="number"
                min={0}
                step={1}
                value={form.order}
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    order: e.target.value,
                  }))
                }
                placeholder="0"
                className="mt-1"
                data-ocid="category-order-input"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              value={form.description}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  description: e.target.value,
                }))
              }
              placeholder="Short description for this category..."
              className="mt-1 resize-none"
              rows={3}
              data-ocid="category-description-input"
            />
          </div>

          <div>
            <Label htmlFor="cat-tags">Tags</Label>
            <Input
              id="cat-tags"
              value={form.tags}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  tags: e.target.value,
                }))
              }
              placeholder="luxury, modern, outdoor"
              className="mt-1"
              data-ocid="category-tags-input"
            />
          </div>

          <div>
            <Label htmlFor="cat-meta-title">Meta Title</Label>
            <Input
              id="cat-meta-title"
              value={form.metaTitle}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  metaTitle: e.target.value,
                }))
              }
              placeholder="SEO title"
              className="mt-1"
              data-ocid="category-meta-title-input"
            />
          </div>

          <div>
            <Label htmlFor="cat-meta-description">Meta Description</Label>
            <Textarea
              id="cat-meta-description"
              value={form.metaDescription}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  metaDescription: e.target.value,
                }))
              }
              placeholder="SEO description"
              className="mt-1 resize-none"
              rows={3}
              data-ocid="category-meta-description-input"
            />
          </div>

          <div className="flex items-end">
            <label
              htmlFor="cat-active"
              className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                id="cat-active"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 cursor-pointer"
                data-ocid="category-active-toggle"
              />
              Active
            </label>
          </div>

          <div>
            <Label htmlFor="cat-image">Image</Label>
            <Input
              id="cat-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 cursor-pointer"
              data-ocid="category-image-input"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-[120px] h-[120px] object-cover rounded-lg border border-border shadow-subtle"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={handleDeleteClose}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              data-ocid="confirm-delete"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeleteClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div />
      </Modal>
    </div>
  );
}
