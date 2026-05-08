import { apiClient, resolveApiAssetUrl } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface ProductCategory {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Product {
  _id: string;
  categoryId: string | ProductCategory;
  name: string;
  slug?: string;
  image: string;
  gallery: string[];
  shortDescription?: string;
  description?: string;
  material?: string;
  frame?: string;
  cushions?: string;
  warranty?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsResponse {
  product?: Product;
  products?: Product[];
}

function normalizeProductCategory(
  category: string | ProductCategory,
): string | ProductCategory {
  if (typeof category === "string") {
    return category;
  }

  return {
    ...category,
    image: resolveApiAssetUrl(category.image ?? ""),
  };
}

export function getProductCategoryId(product: Product) {
  return typeof product.categoryId === "string"
    ? product.categoryId
    : product.categoryId._id;
}

export function getProductCategoryName(product: Product) {
  return typeof product.categoryId === "string"
    ? "Unassigned"
    : product.categoryId.name;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image: resolveApiAssetUrl(product.image),
    gallery: (product.gallery || []).map(resolveApiAssetUrl),
    categoryId: normalizeProductCategory(product.categoryId),
    tags: product.tags ?? [],
    isActive: product.isActive ?? true,
    order: product.order ?? 0,
  };
}

function getProductPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

export async function getProducts(categoryId?: string) {
  const query = categoryId
    ? `?categoryId=${encodeURIComponent(categoryId)}`
    : "";
  const response = (await apiClient.get(
    `${ENDPOINTS.GET_PRODUCTS}${query}`,
  )) as ProductsResponse;
  return (response.products || []).map(normalizeProduct);
}

export async function addProduct(formData: FormData) {
  const response = (await apiClient.upload(
    ENDPOINTS.ADD_PRODUCT,
    formData,
  )) as ProductsResponse;
  return response.product ? normalizeProduct(response.product) : null;
}

export async function editProduct(id: string, formData: FormData) {
  const response = (await apiClient.upload(
    getProductPath(ENDPOINTS.EDIT_PRODUCT, id),
    formData,
    { method: "PUT" },
  )) as ProductsResponse;
  return response.product ? normalizeProduct(response.product) : null;
}

export async function deleteProduct(id: string) {
  return apiClient.delete(getProductPath(ENDPOINTS.DELETE_PRODUCT, id));
}
