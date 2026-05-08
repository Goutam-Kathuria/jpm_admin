import { apiClient, resolveApiAssetUrl } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface GalleryItem {
  _id: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GalleryResponse {
  gallery?: GalleryItem[] | GalleryItem;
}

function normalizeGalleryItem(item: GalleryItem): GalleryItem {
  return {
    ...item,
    image: resolveApiAssetUrl(item.image),
  };
}

function getGalleryPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

export async function getGallery() {
  const response = (await apiClient.get(
    ENDPOINTS.GET_GALLERY,
  )) as GalleryResponse;
  const gallery = Array.isArray(response.gallery) ? response.gallery : [];
  return gallery.map(normalizeGalleryItem);
}

export async function addGalleryImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = (await apiClient.upload(
    ENDPOINTS.ADD_GALLERY,
    formData,
  )) as GalleryResponse;

  return response.gallery && !Array.isArray(response.gallery)
    ? normalizeGalleryItem(response.gallery)
    : null;
}

export async function editGalleryImage(id: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = (await apiClient.upload(
    getGalleryPath(ENDPOINTS.EDIT_GALLERY, id),
    formData,
    { method: "PUT" },
  )) as GalleryResponse;

  return response.gallery && !Array.isArray(response.gallery)
    ? normalizeGalleryItem(response.gallery)
    : null;
}

export async function deleteGalleryImage(id: string) {
  return apiClient.delete(getGalleryPath(ENDPOINTS.DELETE_GALLERY, id));
}
