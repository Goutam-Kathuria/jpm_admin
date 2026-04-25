import { apiClient, resolveApiAssetUrl } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface Category {
  _id: string;
  name: string;
  image: string;
  slug?: string;
  description?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesResponse {
  category?: Category;
  categories?: Category[];
}

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    image: resolveApiAssetUrl(category.image),
    slug: category.slug ?? "",
    description: category.description ?? "",
    tags: category.tags ?? [],
    metaTitle: category.metaTitle ?? "",
    metaDescription: category.metaDescription ?? "",
    isActive: category.isActive ?? true,
    order: category.order ?? 0,
  };
}

// Get single category
export async function getCategory(id: string) {
  const categories = await getCategories();
  return categories.find((category) => category._id === id) ?? null;
}

// Get all categories
export async function getCategories() {
  const response = (await apiClient.get(
    ENDPOINTS.GET_CATEGORIES,
  )) as CategoriesResponse;
  return (response.categories || []).map(normalizeCategory);
}

// Add new category with file
export async function addCategory(formData: FormData) {
  const response = (await apiClient.upload(
    ENDPOINTS.ADD_CATEGORY,
    formData,
  )) as CategoriesResponse;
  return response.category ? normalizeCategory(response.category) : null;
}

// Edit category with file
export async function editCategory(id: string, formData: FormData) {
  const response = (await apiClient.upload(
    ENDPOINTS.EDIT_CATEGORY.replace(":id", id),
    formData,
    { method: "PUT" },
  )) as CategoriesResponse;
  return response.category ? normalizeCategory(response.category) : null;
}

// Delete category
export async function deleteCategory(id: string) {
  const response = await apiClient.delete(
    ENDPOINTS.DELETE_CATEGORY.replace(":id", id),
  );
  return response;
}
