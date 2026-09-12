import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  addBanner,
  deleteBanner,
  editBanner,
  getBanners,
  toggleBannerStatus,
  type Banner,
} from "@/lib/bannersApi";
import { getProducts } from "@/lib/productsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Image as ImageIcon,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const bannersQueryKey = ["admin", "banners"];
const productsQueryKey = ["admin", "products"];
const bannerSkeletonItems = Array.from(
  { length: 4 },
  (_, index) => `banner-skeleton-${index}`,
);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

interface BannerFormData {
  productId: string;
  image: File | null;
  displayOrder: number;
  isActive: boolean;
}

export function BannersPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    productId: "",
    image: null,
    displayOrder: 0,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const bannersQuery = useQuery({
    queryKey: bannersQueryKey,
    queryFn: getBanners,
  });

  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: () => getProducts(),
  });

  const addBannerMutation = useMutation({
    mutationFn: addBanner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner created successfully");
      closeDialog();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const editBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof editBanner>[1] }) =>
      editBanner(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner updated successfully");
      closeDialog();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleBannerStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner status updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const banners = bannersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const isLoading = addBannerMutation.isPending || editBannerMutation.isPending;

  function openAddDialog() {
    setEditingBanner(null);
    setFormData({
      productId: "",
      image: null,
      displayOrder: banners.length,
      isActive: true,
    });
    setImagePreview("");
    setIsDialogOpen(true);
  }

  function openEditDialog(banner: Banner) {
    setEditingBanner(banner);
    setFormData({
      productId: banner.productId._id,
      image: null,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setImagePreview(banner.image);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      productId: "",
      image: null,
      displayOrder: 0,
      isActive: true,
    });
    setImagePreview("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }

    if (!editingBanner && !formData.image) {
      toast.error("Please select an image");
      return;
    }

    if (editingBanner) {
      editBannerMutation.mutate({
        id: editingBanner._id,
        data: {
          productId: formData.productId,
          image: formData.image ?? undefined,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        },
      });
    } else {
      if (!formData.image) return;
      addBannerMutation.mutate({
        productId: formData.productId,
        image: formData.image,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      });
    }
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteBannerMutation.mutate(id);
    }
  }

  function handleToggleStatus(id: string) {
    toggleStatusMutation.mutate(id);
  }

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle={`${banners.length} banner${banners.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={openAddDialog} data-ocid="add-banner-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        }
      />

      {bannersQuery.isLoading && (
        <div className="grid gap-4">
          {bannerSkeletonItems.map((item) => (
            <Skeleton key={item} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {bannersQuery.isError && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
            <ImageIcon className="w-9 h-9 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Banners could not load
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getErrorMessage(bannersQuery.error)}
            </p>
          </div>
          <Button variant="outline" onClick={() => bannersQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!bannersQuery.isLoading && !bannersQuery.isError && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
            <ImageIcon className="w-9 h-9 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              No banners yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first banner to display on the website
            </p>
          </div>
          <Button variant="outline" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first banner
          </Button>
        </div>
      )}

      {banners.length > 0 && (
        <div className="grid gap-4" data-ocid="banners-list">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="group relative rounded-xl border border-border bg-card p-4 shadow-sm"
              data-ocid="banner-item"
            >
              <div className="flex gap-4">
                {/* Banner Image */}
                <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                  <img
                    src={banner.image}
                    alt={banner.productId.name}
                    className="w-full h-full object-cover"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {banner.productId.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Display Order: {banner.displayOrder}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(banner._id)}
                      disabled={toggleStatusMutation.isPending}
                    >
                      <Power className="w-3.5 h-3.5 mr-1.5" />
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(banner._id)}
                      disabled={deleteBannerMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Banner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <Label htmlFor="productId">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) =>
                  setFormData({ ...formData, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">
                Banner Image {!editingBanner && "*"}
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {formData.image || imagePreview ? "Change Image" : "Select Image"}
              </Button>
              {imagePreview && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Display Order */}
            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : editingBanner
                  ? "Update Banner"
                  : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
