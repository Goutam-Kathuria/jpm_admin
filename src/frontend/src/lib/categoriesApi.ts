import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface Category {
  _id: string;
  name: string;
  image: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Get single category
export async function getCategory(id: string) {
  const response = await apiClient.get(
    ENDPOINTS.GET_CATEGORY.replace(":id", id)
  );
  return response.category;
}

// Get all categories
export async function getCategories() {
  const response = await apiClient.get(ENDPOINTS.GET_CATEGORIES);
  return response.categories || [];
}

// Add new category with file
export async function addCategory(formData: FormData) {
  const response = await apiClient.upload(ENDPOINTS.ADD_CATEGORY, formData);
  return response.category;
}

// Edit category with file
export async function editCategory(id: string, formData: FormData) {
  const response = await apiClient.upload(
    ENDPOINTS.EDIT_CATEGORY.replace(":id", id),
    formData,
    { method: "PUT" }
  );
  return response.category;
}

// Delete category
export async function deleteCategory(id: string) {
  const response = await apiClient.delete(
    ENDPOINTS.EDIT_CATEGORY.replace(":id", id)
  );
  return response;
}
