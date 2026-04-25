import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  type Review,
  addReview,
  deleteReview,
  editReview,
  getReviews,
} from "@/lib/reviewsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareQuote, Pencil, Plus, Quote, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewFormValues {
  name: string;
  description: string;
}

const emptyReview: ReviewFormValues = {
  name: "",
  description: "",
};

const reviewsQueryKey = ["admin", "reviews"];
const reviewSkeletonItems = Array.from(
  { length: 6 },
  (_, index) => `review-skeleton-${index}`,
);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildReviewFormData(
  form: ReviewFormValues,
  selectedImageFile: File | null,
) {
  const formData = new FormData();
  formData.append("name", form.name.trim());
  formData.append("description", form.description.trim());

  if (selectedImageFile) {
    formData.append("profilePic", selectedImageFile);
  }

  return formData;
}

export function ReviewsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(emptyReview);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const reviewsQuery = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: getReviews,
  });

  const saveReviewMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id?: string;
      formData: FormData;
    }) => {
      if (id) {
        return editReview(id, formData);
      }

      return addReview(formData);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
      setModalOpen(false);
      resetForm();
      toast.success(variables.id ? "Review updated" : "Review added");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
      setDeleteId(null);
      toast.success("Review deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const reviews = reviewsQuery.data ?? [];
  const isSaving = saveReviewMutation.isPending;
  const isDeleting = deleteReviewMutation.isPending;

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function resetForm() {
    setEditing(null);
    setForm(emptyReview);
    setImagePreview("");
    setSelectedImageFile(null);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(review: Review) {
    setEditing(review);
    setForm({
      name: review.name,
      description: review.description,
    });
    setImagePreview(review.profilePic ?? "");
    setSelectedImageFile(null);
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
    setImagePreview(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Reviewer name is required");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Review description is required");
      return;
    }

    saveReviewMutation.mutate({
      id: editing?._id,
      formData: buildReviewFormData(form, selectedImageFile),
    });
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteReviewMutation.mutate(deleteId);
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

      {reviewsQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reviewSkeletonItems.map((item) => (
            <Skeleton key={item} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {reviewsQuery.isError && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
            <MessageSquareQuote className="w-9 h-9 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Reviews could not load
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getErrorMessage(reviewsQuery.error)}
            </p>
          </div>
          <Button variant="outline" onClick={() => reviewsQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!reviewsQuery.isLoading &&
        !reviewsQuery.isError &&
        reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
              <MessageSquareQuote className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                No reviews yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first client review.
              </p>
            </div>
            <Button variant="outline" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </div>
        )}

      {reviews.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          data-ocid="reviews-grid"
        >
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-card border border-border rounded-xl p-6 shadow-subtle hover:shadow-elevated transition-all duration-300 group"
              data-ocid="review-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={review.profilePic} alt={review.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {getInitials(review.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Client review
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={() => openEdit(review)}
                    disabled={isSaving || isDeleting}
                    data-ocid="edit-review"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(review._id)}
                    disabled={isSaving || isDeleting}
                    data-ocid="delete-review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 relative">
                <Quote className="w-6 h-6 text-primary/20 absolute -top-1 -left-1" />
                <p className="text-sm text-muted-foreground leading-relaxed pl-5 line-clamp-4">
                  {review.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? "Edit Review" : "Add Review"}
        footer={
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="save-review"
            >
              {isSaving
                ? editing
                  ? "Saving..."
                  : "Adding..."
                : editing
                  ? "Save Changes"
                  : "Add Review"}
            </Button>
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="rev-name">Reviewer Name</Label>
            <Input
              id="rev-name"
              value={form.name}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Isabelle Fontaine"
              className="mt-1"
              data-ocid="review-name-input"
            />
          </div>
          <div>
            <Label htmlFor="rev-msg">Description</Label>
            <Textarea
              id="rev-msg"
              value={form.description}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  description: e.target.value,
                }))
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

      <Modal
        open={!!deleteId}
        onClose={handleDeleteClose}
        title="Delete Review"
        description="Are you sure? This action cannot be undone."
        footer={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              data-ocid="confirm-delete-review"
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
