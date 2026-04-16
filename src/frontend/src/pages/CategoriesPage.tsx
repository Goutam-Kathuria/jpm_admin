import { TableSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
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
}

const emptyForm: CategoryFormValues = { name: "" };
const categoriesQueryKey = ["admin", "categories"];

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
      toast.success(
        variables.id ? "Category updated" : "Category added",
      );
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

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
    setSelectedImageFile(null);
    clearFileInput();
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({ name: category.name });
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
    setSelectedImageFile(null);
    clearFileInput();
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

  function handleNameChange(name: string) {
    setForm((currentForm) => ({
      ...currentForm,
      name,
    }));
  }

  function handleSave() {
    const name = form.name.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (selectedImageFile) {
      formData.append("image", selectedImageFile);
    }

    saveCategoryMutation.mutate({
      id: editing?._id,
      formData,
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
            <TableSkeleton rows={5} columns={3} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16 text-muted-foreground font-medium">
                  Image
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Name
                </TableHead>
                <TableHead className="w-28 text-right text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesQuery.isError && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
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
                  <TableCell colSpan={3}>
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
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Seating"
              className="mt-1"
              data-ocid="category-name-input"
            />
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
