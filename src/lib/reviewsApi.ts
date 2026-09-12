import { apiClient, resolveApiAssetUrl } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface Review {
  _id: string;
  name: string;
  description: string;
  profilePic?: string;
  googleReviewId?: string;
  platform?: string;
  rating?: number;
  reviewDate?: string;
  authorUrl?: string;
  visible?: boolean;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ReviewsResponse {
  review?: Review;
  reviews?: Review[];
}

interface GoogleReviewsSyncResponse {
  message: string;
  synced: number;
  skipped: number;
  total: number;
  placeRating?: number;
  totalPlaceReviews?: number;
}

interface GoogleReviewsStatusResponse {
  configured: boolean;
  enabled: boolean;
  apiKeySet: boolean;
  placeIdSet: boolean;
  googleReviewsCount: number;
}

function normalizeReview(review: Review): Review {
  return {
    ...review,
    profilePic: resolveApiAssetUrl(review.profilePic ?? ""),
  };
}

function getReviewPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

export async function getReviews() {
  const response = (await apiClient.get(
    ENDPOINTS.GET_REVIEWS,
  )) as ReviewsResponse;
  return (response.reviews || []).map(normalizeReview);
}

export async function addReview(formData: FormData) {
  const response = (await apiClient.upload(
    ENDPOINTS.ADD_REVIEW,
    formData,
  )) as ReviewsResponse;
  return response.review ? normalizeReview(response.review) : null;
}

export async function editReview(id: string, formData: FormData) {
  const response = (await apiClient.upload(
    getReviewPath(ENDPOINTS.EDIT_REVIEW, id),
    formData,
    { method: "PUT" },
  )) as ReviewsResponse;
  return response.review ? normalizeReview(response.review) : null;
}

export async function deleteReview(id: string) {
  return apiClient.delete(getReviewPath(ENDPOINTS.DELETE_REVIEW, id));
}

export async function syncGoogleReviews(): Promise<GoogleReviewsSyncResponse> {
  return apiClient.post("/admin/google-reviews/sync", {}) as Promise<GoogleReviewsSyncResponse>;
}

export async function getGoogleReviewsStatus(): Promise<GoogleReviewsStatusResponse> {
  return apiClient.get("/admin/google-reviews/status") as Promise<GoogleReviewsStatusResponse>;
}
