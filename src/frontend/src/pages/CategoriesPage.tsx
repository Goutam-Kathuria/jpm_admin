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
import { type Category, mockCategories } from "@/data/mockData";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const emptyForm: Omit<Category, "id"> = { name: "", slug: "", image: "" };

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modalOpen) {
      // revoke object URL on close to avoid memory leaks
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    }
  }, [modalOpen, preview]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image });
    setPreview(cat.image);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setForm((f) => ({ ...f, image: url }));
    }
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (editing) {
      setCategories((cats) =>
        cats.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)),
      );
      toast.success("Category updated");
    } else {
      setCategories((cats) => [...cats, { id: `cat-${Date.now()}`, ...form }]);
      toast.success("Category added");
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setCategories((cats) => cats.filter((c) => c.id !== id));
    setDeleteId(null);
    toast.success("Category deleted");
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
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-16 text-muted-foreground font-medium">
                Image
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Slug
              </TableHead>
              <TableHead className="w-28 text-right text-muted-foreground font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
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
            {categories.map((cat) => (
              <TableRow
                key={cat.id}
                className="border-border hover:bg-muted/40 transition-colors duration-150"
                data-ocid="category-row"
              >
                {/* Thumbnail */}
                <TableCell>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>

                {/* Name */}
                <TableCell>
                  <span className="font-medium text-foreground">
                    {cat.name}
                  </span>
                </TableCell>

                {/* Slug */}
                <TableCell>
                  <span className="text-sm text-muted-foreground font-mono">
                    /{cat.slug}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent/50 hover:text-accent-foreground"
                      onClick={() => openEdit(cat)}
                      aria-label={`Edit ${cat.name}`}
                      data-ocid="edit-category"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteId(cat.id)}
                      aria-label={`Delete ${cat.name}`}
                      data-ocid="delete-category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <div className="flex gap-2">
            <Button onClick={handleSave} data-ocid="save-category">
              {editing ? "Save Changes" : "Add Category"}
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
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

          {/* Slug */}
          <div>
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. seating"
              className="mt-1 font-mono text-sm"
              data-ocid="category-slug-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Auto-generated from name. You can edit it manually.
            </p>
          </div>

          {/* Image */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="confirm-delete"
            >
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
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
