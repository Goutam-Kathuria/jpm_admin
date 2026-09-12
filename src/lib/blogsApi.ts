import { resolveApiAssetUrl } from "@/api/apiClient";
import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  visible: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveBlogInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  coverImage?: File | null;
  authorName?: string;
  publishedAt?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  visible?: boolean;
  order?: number;
}

interface BlogsResponse {
  blogs?: Blog[];
}

interface BlogResponse {
  blog?: Blog;
}

function normalizeBlog(blog: Blog): Blog {
  return {
    ...blog,
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? "",
    coverImageUrl: resolveApiAssetUrl(blog.coverImageUrl ?? ""),
    authorName: blog.authorName ?? "JPM Enterprises",
    publishedAt: blog.publishedAt ?? "",
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    metaTitle: blog.metaTitle ?? "",
    metaDescription: blog.metaDescription ?? "",
    featured: blog.featured === true,
    visible: blog.visible !== false,
    order: typeof blog.order === "number" ? blog.order : 0,
  };
}

function getBlogPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

function buildBlogFormData(input: SaveBlogInput) {
  const formData = new FormData();

  formData.append("title", input.title);
  formData.append("slug", input.slug ?? "");
  formData.append("excerpt", input.excerpt ?? "");
  formData.append("content", input.content ?? "");
  formData.append("coverImageUrl", input.coverImageUrl ?? "");
  formData.append("authorName", input.authorName ?? "JPM Enterprises");
  formData.append("publishedAt", input.publishedAt ?? "");
  formData.append("tags", JSON.stringify(input.tags ?? []));
  formData.append("metaTitle", input.metaTitle ?? "");
  formData.append("metaDescription", input.metaDescription ?? "");
  formData.append("featured", String(input.featured === true));
  formData.append("visible", String(input.visible !== false));
  formData.append("order", String(input.order ?? 0));

  if (input.coverImage instanceof File) {
    formData.append("coverImage", input.coverImage);
  }

  return formData;
}

export async function getBlogs() {
  const response = (await apiClient.get(ENDPOINTS.GET_BLOGS)) as BlogsResponse;
  return (response.blogs ?? []).map(normalizeBlog);
}

export async function addBlog(input: SaveBlogInput) {
  const response = (await apiClient.upload(
    ENDPOINTS.ADD_BLOG,
    buildBlogFormData(input),
  )) as BlogResponse;
  return response.blog ? normalizeBlog(response.blog) : null;
}

export async function editBlog(id: string, input: SaveBlogInput) {
  const response = (await apiClient.upload(
    getBlogPath(ENDPOINTS.EDIT_BLOG, id),
    buildBlogFormData(input),
    { method: "PUT" },
  )) as BlogResponse;
  return response.blog ? normalizeBlog(response.blog) : null;
}

export async function deleteBlog(id: string) {
  return apiClient.delete(getBlogPath(ENDPOINTS.DELETE_BLOG, id));
}
