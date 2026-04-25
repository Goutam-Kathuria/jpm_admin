import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addGalleryImage,
  deleteGalleryImage,
  getGallery,
} from "@/lib/galleryApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const galleryQueryKey = ["admin", "gallery"];
const gallerySkeletonItems = Array.from(
  { length: 8 },
  (_, index) => `gallery-skeleton-${index}`,
);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function GalleryPage() {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galleryQuery = useQuery({
    queryKey: galleryQueryKey,
    queryFn: getGallery,
  });

  const uploadGalleryMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return Promise.all(files.map((file) => addGalleryImage(file)));
    },
    onSuccess: async (_, files) => {
      await queryClient.invalidateQueries({ queryKey: galleryQueryKey });
      toast.success(
        files.length === 1
          ? "Image uploaded"
          : `${files.length} images uploaded`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: galleryQueryKey });
      toast.success("Image removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const items = galleryQuery.data ?? [];
  const isUploading = uploadGalleryMutation.isPending;
  const isDeleting = deleteGalleryMutation.isPending;

  function processFiles(files: FileList | null) {
    if (!files || files.length === 0 || isUploading) {
      return;
    }

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length === 0) {
      toast.error("No valid images selected");
      return;
    }

    uploadGalleryMutation.mutate(imageFiles);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(e.target.files);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  function handleDelete(id: string) {
    if (isDeleting) {
      return;
    }

    deleteGalleryMutation.mutate(id);
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle={`${items.length} gallery images`}
        action={
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            data-ocid="upload-gallery-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Images"}
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        data-ocid="gallery-file-input"
      />

      <button
        type="button"
        className={[
          "w-full mb-8 border-2 border-dashed rounded-2xl py-12 px-6",
          "flex flex-col items-center justify-center gap-3",
          "transition-all duration-200 cursor-pointer group",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
        ].join(" ")}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        aria-label="Upload images"
        data-ocid="gallery-upload-zone"
      >
        <div
          className={[
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200",
            dragging
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          ].join(" ")}
        >
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isUploading ? "Uploading images..." : "Click to upload images"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or drag and drop PNG, JPG, WEBP files
          </p>
        </div>
      </button>

      {galleryQuery.isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallerySkeletonItems.map((item) => (
            <Skeleton key={item} className="aspect-square rounded-xl" />
          ))}
        </div>
      )}

      {galleryQuery.isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
            <Image className="w-9 h-9 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Gallery could not load
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getErrorMessage(galleryQuery.error)}
            </p>
          </div>
          <Button variant="outline" onClick={() => galleryQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!galleryQuery.isLoading &&
        !galleryQuery.isError &&
        items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            data-ocid="gallery-empty-state"
          >
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
              <Image className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                No images yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first image to start building your gallery
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              data-ocid="empty-state-upload-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload your first image
            </Button>
          </div>
        )}

      {items.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="gallery-grid"
        >
          {items.map((item) => (
            <div
              key={item._id}
              className="group relative rounded-xl overflow-hidden border border-border shadow-sm"
              data-ocid="gallery-item"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={item.image}
                  alt="Gallery"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <button
                type="button"
                onClick={() => handleDelete(item._id)}
                disabled={isDeleting}
                className={[
                  "absolute top-2 right-2 w-8 h-8 rounded-full",
                  "bg-card/90 text-foreground flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-all duration-200",
                  "hover:bg-destructive hover:text-destructive-foreground",
                  "pointer-events-auto z-10 shadow-sm disabled:opacity-60",
                ].join(" ")}
                aria-label="Delete gallery image"
                data-ocid="delete-gallery-item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
