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
import { Textarea } from "@/components/ui/textarea";
import { type Product, mockCategories, mockProducts } from "@/data/mockData";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const emptyForm: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  featured: false,
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      featured: p.featured,
    });
    setPreview(p.image);
    setModalOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setForm((f) => ({ ...f, image: url }));
    }
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (editing) {
      setProducts((ps) =>
        ps.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)),
      );
      toast.success("Product updated");
    } else {
      setProducts((ps) => [...ps, { id: `prod-${Date.now()}`, ...form }]);
      toast.success("Product added");
    }
    setModalOpen(false);
  }

  function handleToggleFeatured(p: Product) {
    const next = !p.featured;
    setProducts((ps) =>
      ps.map((prod) => (prod.id === p.id ? { ...prod, featured: next } : prod)),
    );
    toast.success(next ? "Marked as featured" : "Removed from featured");
  }

  function handleDelete(id: string) {
    setProducts((ps) => ps.filter((p) => p.id !== id));
    setDeleteId(null);
    toast.success("Product deleted");
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        action={
          <Button onClick={openAdd} data-ocid="add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="products-table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Category
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Price
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Featured
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  data-ocid="product-row"
                >
                  {/* Image + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || "/assets/images/placeholder.svg"}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {p.category}
                    </Badge>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                    ${p.price.toLocaleString()}
                  </td>

                  {/* Featured badge */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {p.featured ? (
                      <Badge
                        className="text-xs bg-primary/15 text-primary border-primary/30 font-medium"
                        variant="outline"
                      >
                        Featured
                      </Badge>
                    ) : (
                      <Badge
                        className="text-xs bg-muted text-muted-foreground border-border font-medium"
                        variant="outline"
                      >
                        Standard
                      </Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Featured toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 transition-colors ${
                          p.featured
                            ? "text-primary hover:text-primary/70"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                        onClick={() => handleToggleFeatured(p)}
                        aria-label={
                          p.featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        data-ocid="toggle-featured"
                      >
                        <Star
                          className="w-4 h-4"
                          fill={p.featured ? "currentColor" : "none"}
                        />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(p)}
                        aria-label="Edit product"
                        data-ocid="edit-product"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(p.id)}
                        aria-label="Delete product"
                        data-ocid="delete-product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button onClick={handleSave} data-ocid="save-product">
              {editing ? "Save Changes" : "Add Product"}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="prod-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prod-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Lyon Sectional Sofa"
              className="mt-1"
              data-ocid="product-name-input"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief product description..."
              className="mt-1 resize-none"
              rows={3}
              data-ocid="product-desc-input"
            />
          </div>

          {/* Price + Category side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prod-price">
                Price <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                  $
                </span>
                <Input
                  id="prod-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  className="pl-7"
                  data-ocid="product-price-input"
                />
              </div>
            </div>

            <div>
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="product-category-select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <Label htmlFor="prod-image">Image</Label>
            <Input
              id="prod-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
              data-ocid="product-image-input"
            />
            {preview && (
              <div className="mt-3 flex items-start gap-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-[120px] h-[120px] object-cover rounded-lg border border-border shrink-0"
                />
                <p className="text-xs text-muted-foreground pt-1">
                  Image preview
                </p>
              </div>
            )}
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="prod-featured"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="w-4 h-4 cursor-pointer"
              data-ocid="product-featured-toggle"
            />
            <Label htmlFor="prod-featured" className="cursor-pointer">
              Mark as featured
            </Label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="confirm-delete-product"
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
