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
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/lib/categoriesApi";
import {
  type Product,
  addProduct,
  deleteProduct,
  editProduct,
  getProductCategoryId,
  getProductCategoryName,
  getProducts,
} from "@/lib/productsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProductFormValues {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  material: string;
  frame: string;
  cushions: string;
  warranty: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  order: string;
  isActive: boolean;
}

const emptyForm: ProductFormValues = {
  name: "",
  slug: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  material: "",
  frame: "",
  cushions: "",
  warranty: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  order: "0",
  isActive: true,
};

const productsQueryKey = ["admin", "products"];
const categoriesQueryKey = ["admin", "categories"];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function buildProductFormData(
  form: ProductFormValues,
  selectedImageFile: File | null,
) {
  const formData = new FormData();
  formData.append("name", form.name.trim());
  formData.append("categoryId", form.categoryId);
  formData.append("shortDescription", form.shortDescription.trim());
  formData.append("description", form.description.trim());
  formData.append("isActive", String(form.isActive));

  if (form.slug.trim()) {
    formData.append("slug", form.slug.trim());
  }

  if (form.material.trim()) {
    formData.append("material", form.material.trim());
  }

  if (form.frame.trim()) {
    formData.append("frame", form.frame.trim());
  }

  if (form.cushions.trim()) {
    formData.append("cushions", form.cushions.trim());
  }

  if (form.warranty.trim()) {
    formData.append("warranty", form.warranty.trim());
  }

  if (form.tags.trim()) {
    formData.append("tags", form.tags.trim());
  }

  if (form.metaTitle.trim()) {
    formData.append("metaTitle", form.metaTitle.trim());
  }

  if (form.metaDescription.trim()) {
    formData.append("metaDescription", form.metaDescription.trim());
  }

  const order = form.order.trim();
  if (order) {
    formData.append("order", order);
  }

  if (selectedImageFile) {
    formData.append("image", selectedImageFile);
  }

  return formData;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [preview, setPreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: () => getProducts(),
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: getCategories,
  });

  const saveProductMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id?: string;
      formData: FormData;
    }) => {
      if (id) {
        return editProduct(id, formData);
      }

      return addProduct(formData);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setModalOpen(false);
      resetForm();
      toast.success(variables.id ? "Product updated" : "Product added");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const toggleProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const formData = new FormData();
      formData.append("isActive", String(!product.isActive));
      return editProduct(product._id, formData);
    },
    onSuccess: async (_, product) => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success(product.isActive ? "Product hidden" : "Product activated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setDeleteId(null);
      toast.success("Product deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const isSaving = saveProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;
  const isToggling = toggleProductMutation.isPending;

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

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug ?? "",
      categoryId: getProductCategoryId(product),
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      material: product.material ?? "",
      frame: product.frame ?? "",
      cushions: product.cushions ?? "",
      warranty: product.warranty ?? "",
      tags: (product.tags ?? []).join(", "),
      metaTitle: product.metaTitle ?? "",
      metaDescription: product.metaDescription ?? "",
      order: String(product.order ?? 0),
      isActive: product.isActive,
    });
    setPreview(product.image);
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
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    saveProductMutation.mutate({
      id: editing?._id,
      formData: buildProductFormData(form, selectedImageFile),
    });
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteProductMutation.mutate(deleteId);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} catalog products`}
        action={
          <Button onClick={openAdd} data-ocid="add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          {productsQuery.isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={6} columns={5} />
            </div>
          ) : (
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
                    Order
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.isError && products.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                        <p className="text-sm text-muted-foreground">
                          {getErrorMessage(productsQuery.error)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => productsQuery.refetch()}
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {!productsQuery.isError && products.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <ImageIcon className="w-10 h-10 opacity-30" />
                        <p className="text-sm">
                          No products yet. Add one to get started.
                        </p>
                        <Button variant="outline" size="sm" onClick={openAdd}>
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add Product
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid="product-row"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.image || "/assets/images/placeholder.svg"
                          }
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.shortDescription ||
                              product.description ||
                              "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {getProductCategoryName(product)}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {product.order}
                    </td>

                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <Badge
                        className={
                          product.isActive
                            ? "text-xs bg-primary/15 text-primary border-primary/30 font-medium"
                            : "text-xs bg-muted text-muted-foreground border-border font-medium"
                        }
                        variant="outline"
                      >
                        {product.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary"
                          onClick={() => toggleProductMutation.mutate(product)}
                          aria-label={
                            product.isActive
                              ? "Hide product"
                              : "Activate product"
                          }
                          disabled={isSaving || isDeleting || isToggling}
                          data-ocid="toggle-product-status"
                        >
                          {product.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(product)}
                          aria-label="Edit product"
                          disabled={isSaving || isDeleting}
                          data-ocid="edit-product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(product._id)}
                          aria-label="Delete product"
                          disabled={isSaving || isDeleting || isToggling}
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
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || categoriesQuery.isLoading}
              data-ocid="save-product"
            >
              {isSaving
                ? editing
                  ? "Saving..."
                  : "Adding..."
                : editing
                  ? "Save Changes"
                  : "Add Product"}
            </Button>
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Required Section */}
          <div className="pb-3 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Required Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prod-name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prod-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Lyon Sectional Sofa"
                  className="mt-1"
                  data-ocid="product-name-input"
                />
              </div>

              <div>
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, categoryId: value }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="product-category-select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    {categories.length === 0 && (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prod-short-desc">Short Description</Label>
                <Textarea
                  id="prod-short-desc"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Brief product summary..."
                  className="mt-1 resize-none"
                  rows={2}
                  data-ocid="product-short-desc-input"
                />
              </div>

              <div>
                <Label htmlFor="prod-desc">Description</Label>
                <Textarea
                  id="prod-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Full product description..."
                  className="mt-1 resize-none"
                  rows={4}
                  data-ocid="product-desc-input"
                />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="pb-3 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Product Details <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-slug">URL Slug</Label>
                  <Input
                    id="prod-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="lyon-sectional-sofa"
                    className="mt-1"
                    data-ocid="product-slug-input"
                  />
                </div>

                <div>
                  <Label htmlFor="prod-material">Material Type</Label>
                  <Input
                    id="prod-material"
                    value={form.material}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, material: e.target.value }))
                    }
                    placeholder="e.g. Leather, Fabric"
                    className="mt-1"
                    data-ocid="product-material-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-frame">Frame Type</Label>
                  <Input
                    id="prod-frame"
                    value={form.frame}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, frame: e.target.value }))
                    }
                    placeholder="e.g. Hardwood, Metal"
                    className="mt-1"
                    data-ocid="product-frame-input"
                  />
                </div>

                <div>
                  <Label htmlFor="prod-cushion">
                    Cushion Type <span className="text-xs text-amber-600">optional</span>
                  </Label>
                  <Input
                    id="prod-cushion"
                    value={form.cushions}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cushions: e.target.value }))
                    }
                    placeholder="e.g. Memory Foam, Spring"
                    className="mt-1"
                    data-ocid="product-cushion-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prod-warranty">
                  Warranty Period{" "}
                  <span className="text-xs text-blue-600 font-normal">
                    (Leave blank if no warranty)
                  </span>
                </Label>
                <Input
                  id="prod-warranty"
                  value={form.warranty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, warranty: e.target.value }))
                  }
                  placeholder="e.g. 2 Years, 5 Years, Covers entire product lifespan"
                  className="mt-1"
                  data-ocid="product-warranty-input"
                />
              </div>

              <div>
                <Label htmlFor="prod-tags">
                  Tags <span className="text-xs text-muted-foreground font-normal">(comma-separated)</span>
                </Label>
                <Input
                  id="prod-tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="e.g. modern, luxury, bestseller"
                  className="mt-1"
                  data-ocid="product-tags-input"
                />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="pb-3 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              SEO & Metadata <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prod-meta-title">Meta Title</Label>
                <Input
                  id="prod-meta-title"
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaTitle: e.target.value }))
                  }
                  placeholder="For search engines"
                  className="mt-1"
                  maxLength={60}
                  data-ocid="product-meta-title-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.metaTitle.length}/60
                </p>
              </div>

              <div>
                <Label htmlFor="prod-meta-desc">Meta Description</Label>
                <Textarea
                  id="prod-meta-desc"
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="For search engines"
                  className="mt-1 resize-none"
                  rows={2}
                  maxLength={160}
                  data-ocid="product-meta-desc-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.metaDescription.length}/160
                </p>
              </div>
            </div>
          </div>

          {/* Display & Options */}
          <div className="pb-3">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Display Options
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-order">Sort Order</Label>
                  <Input
                    id="prod-order"
                    type="number"
                    min={0}
                    step={1}
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, order: e.target.value }))
                    }
                    placeholder="0"
                    className="mt-1"
                    data-ocid="product-order-input"
                  />
                </div>

                <div className="flex items-end">
                  <label
                    htmlFor="prod-active"
                    className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="prod-active"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 cursor-pointer"
                      data-ocid="product-active-toggle"
                    />
                    Active
                  </label>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={handleDeleteClose}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              data-ocid="confirm-delete-product"
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
