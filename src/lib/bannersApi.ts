import { apiClient, resolveApiAssetUrl } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface BannerProduct {
  _id: string;
  name: string;
  slug: string;
}

export interface Banner {
  _id: string;
  productId: BannerProduct;
  image: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BannerResponse {
  banner?: Banner;
  banners?: Banner[];
}

function normalizeBanner(banner: Banner): Banner {
  return {
    ...banner,
    image: resolveApiAssetUrl(banner.image),
  };
}

function getBannerPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

export async function getBanners() {
  const response = (await apiClient.get(ENDPOINTS.GET_BANNERS)) as BannerResponse;
  const banners = Array.isArray(response.banners) ? response.banners : [];
  return banners.map(normalizeBanner);
}

export async function getBannerById(id: string) {
  const response = (await apiClient.get(
    getBannerPath(ENDPOINTS.GET_BANNER, id),
  )) as BannerResponse;
  
  return response.banner ? normalizeBanner(response.banner) : null;
}

export async function addBanner(data: {
  productId: string;
  image: File;
  displayOrder?: number;
  isActive?: boolean;
}) {
  const formData = new FormData();
  formData.append("productId", data.productId);
  formData.append("image", data.image);
  formData.append("displayOrder", String(data.displayOrder ?? 0));
  formData.append("isActive", String(data.isActive ?? true));

  const response = (await apiClient.upload(
    ENDPOINTS.ADD_BANNER,
    formData,
  )) as BannerResponse;

  return response.banner ? normalizeBanner(response.banner) : null;
}

export async function editBanner(
  id: string,
  data: {
    productId?: string;
    image?: File;
    displayOrder?: number;
    isActive?: boolean;
  },
) {
  const formData = new FormData();
  
  if (data.productId) {
    formData.append("productId", data.productId);
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.displayOrder !== undefined) {
    formData.append("displayOrder", String(data.displayOrder));
  }
  if (data.isActive !== undefined) {
    formData.append("isActive", String(data.isActive));
  }

  const response = (await apiClient.upload(
    getBannerPath(ENDPOINTS.EDIT_BANNER, id),
    formData,
    { method: "PUT" },
  )) as BannerResponse;

  return response.banner ? normalizeBanner(response.banner) : null;
}

export async function deleteBanner(id: string) {
  return apiClient.delete(getBannerPath(ENDPOINTS.DELETE_BANNER, id));
}

export async function toggleBannerStatus(id: string) {
  const response = (await apiClient.post(
    getBannerPath(ENDPOINTS.TOGGLE_BANNER_STATUS, id),
  )) as BannerResponse;

  return response.banner ? normalizeBanner(response.banner) : null;
}
