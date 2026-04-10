import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { type GalleryItem, mockGallery } from "@/data/mockData";
import { Image, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(mockGallery);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: GalleryItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `gal-${Date.now()}-${file.name}`,
        url: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, ""),
      }));

    if (newItems.length === 0) {
      toast.error("No valid images selected");
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
    for (const _item of newItems) {
      toast.success("Image added");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(e.target.files);
    // reset so same file can be re-selected
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
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((i) => i.id !== id);
    });
    toast.success("Image removed");
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Manage your image gallery"
        action={
          <Button
            onClick={() => fileInputRef.current?.click()}
            data-ocid="upload-gallery-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        }
      />

      {/* Hidden multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        data-ocid="gallery-file-input"
      />

      {/* Upload Zone */}
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
            Click to upload images
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or drag &amp; drop — PNG, JPG, WEBP supported
          </p>
        </div>
      </button>

      {/* Empty State */}
      {items.length === 0 && (
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
            data-ocid="empty-state-upload-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload your first image
          </Button>
        </div>
      )}

      {/* Image Grid */}
      {items.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="gallery-grid"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-border shadow-sm"
              data-ocid="gallery-item"
            >
              {/* Square image */}
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Delete button — top-right */}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className={[
                  "absolute top-2 right-2 w-8 h-8 rounded-full",
                  "bg-card/90 text-foreground flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-all duration-200",
                  "hover:bg-destructive hover:text-destructive-foreground",
                  "pointer-events-auto z-10 shadow-sm",
                ].join(" ")}
                aria-label={`Delete ${item.caption}`}
                data-ocid="delete-gallery-item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Caption */}
              {item.caption && (
                <p className="text-xs text-muted-foreground truncate px-2 py-1.5 bg-card border-t border-border">
                  {item.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
