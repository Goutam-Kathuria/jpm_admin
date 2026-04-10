import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { StarRating } from "@/components/ui-custom/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Review, mockReviews } from "@/data/mockData";
import { Pencil, Plus, Quote, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyReview: Omit<Review, "id"> = {
  clientName: "",
  message: "",
  rating: 5,
};

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(emptyReview);
  const [imagePreview, setImagePreview] = useState<string>("");

  function openAdd() {
    setEditing(null);
    setForm(emptyReview);
    setImagePreview("");
    setModalOpen(true);
  }

  function openEdit(r: Review) {
    setEditing(r);
    setForm({
      clientName: r.clientName,
      message: r.message,
      rating: r.rating,
      image: r.image,
    });
    setImagePreview(r.image ?? "");
    setModalOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setForm((f) => ({ ...f, image: url }));
    }
  }

  function handleSave() {
    if (!form.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Review message is required");
      return;
    }
    if (editing) {
      setReviews((rs) =>
        rs.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)),
      );
      toast.success("Review updated");
    } else {
      setReviews((rs) => [...rs, { id: `rev-${Date.now()}`, ...form }]);
      toast.success("Review added");
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setReviews((rs) => rs.filter((r) => r.id !== id));
    setDeleteId(null);
    toast.success("Review deleted");
  }

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} client reviews`}
        action={
          <Button onClick={openAdd} data-ocid="add-review">
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        }
      />

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        data-ocid="reviews-grid"
      >
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-card border border-border rounded-xl p-6 shadow-subtle hover:shadow-elevated transition-all duration-300 group"
            data-ocid="review-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={r.image} alt={r.clientName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {r.clientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">
                    {r.clientName}
                  </p>
                  <StarRating value={r.rating} readonly size="sm" />
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => openEdit(r)}
                  data-ocid="edit-review"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(r.id)}
                  data-ocid="delete-review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-4 relative">
              <Quote className="w-6 h-6 text-primary/20 absolute -top-1 -left-1" />
              <p className="text-sm text-muted-foreground leading-relaxed pl-5 line-clamp-4">
                {r.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Review" : "Add Review"}
        footer={
          <div className="flex gap-2">
            <Button onClick={handleSave} data-ocid="save-review">
              {editing ? "Save Changes" : "Add Review"}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="rev-name">Client Name</Label>
            <Input
              id="rev-name"
              value={form.clientName}
              onChange={(e) =>
                setForm((f) => ({ ...f, clientName: e.target.value }))
              }
              placeholder="e.g. Isabelle Fontaine"
              className="mt-1"
              data-ocid="review-name-input"
            />
          </div>
          <div>
            <Label>Rating</Label>
            <div className="mt-1.5">
              <StarRating
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                size="lg"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="rev-msg">Message</Label>
            <Textarea
              id="rev-msg"
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder="Client testimonial..."
              className="mt-1 resize-none"
              rows={4}
              data-ocid="review-message-input"
            />
          </div>
          <div>
            <Label htmlFor="rev-image">Client Photo (optional)</Label>
            <Input
              id="rev-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
              data-ocid="review-image-input"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 w-16 h-16 rounded-full object-cover border border-border"
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Review"
        description="Are you sure? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="confirm-delete-review"
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
