import { apiClient } from "@/api/apiClient";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface ListResponse {
  inquiries?: InquiryRecord[];
}

export async function fetchInquiries(limit = 200) {
  const response = (await apiClient.get(
    `/admin/inquiries?limit=${encodeURIComponent(String(limit))}`,
  )) as ListResponse;
  return response.inquiries ?? [];
}

export async function deleteInquiry(id: string) {
  return apiClient.delete(`/admin/inquiries/${encodeURIComponent(id)}`);
}
