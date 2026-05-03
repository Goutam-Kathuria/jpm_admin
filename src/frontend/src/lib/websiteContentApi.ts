import { apiClient } from "@/api/apiClient";

export interface WebsiteContentRecord {
  modelKey: string;
  visible: boolean;
  data: Record<string, unknown>;
  updatedAt?: string;
  createdAt?: string;
}

interface WebsiteContentEnvelope {
  content: WebsiteContentRecord | null;
  message?: string;
}

export async function fetchWebsiteContent(modelKey: string) {
  const path = `/admin/website-content/${encodeURIComponent(modelKey)}`;

  try {
    const response = (await apiClient.get(path)) as WebsiteContentEnvelope;
    return response.content ?? null;
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : null;

    if (status === 404) {
      return null;
    }

    throw error;
  }
}

export async function saveWebsiteContent(modelKey: string, input: { visible: boolean; data: object }) {
  const path = `/admin/website-content/${encodeURIComponent(modelKey)}`;

  const response = (await apiClient.put(path, {
    visible: input.visible,
    data: input.data,
  })) as WebsiteContentEnvelope;

  return response.content ?? null;
}
