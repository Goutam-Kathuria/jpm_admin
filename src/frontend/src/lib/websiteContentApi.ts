import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface WebsiteContentRecord {
  _id?: string;
  modelKey: string;
  visible: boolean;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface WebsiteContentResponse {
  content?: WebsiteContentRecord;
  contents?: WebsiteContentRecord[];
  message?: string;
}

function normalizeWebsiteContent(
  content: WebsiteContentRecord,
): WebsiteContentRecord {
  return {
    ...content,
    data:
      content.data && typeof content.data === "object" && !Array.isArray(content.data)
        ? content.data
        : {},
  };
}

function getWebsiteContentPath(endpoint: string, modelKey: string) {
  return endpoint.replace(":modelKey", encodeURIComponent(modelKey));
}

/**
 * GET SINGLE WEBSITE CONTENT
 */
export async function getWebsiteContent(modelKey: string) {
  try {
    const response = (await apiClient.get(
      getWebsiteContentPath(
        ENDPOINTS.GET_WEBSITE_CONTENT,
        modelKey,
      ),
    )) as WebsiteContentResponse;

    return response.content
      ? normalizeWebsiteContent(response.content)
      : null;
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

/**
 * GET ALL WEBSITE CONTENTS
 */
export async function getWebsiteContents() {
  const response = (await apiClient.get(
    ENDPOINTS.GET_WEBSITE_CONTENTS,
  )) as WebsiteContentResponse;

  return (response.contents || []).map(normalizeWebsiteContent);
}

/**
 * SAVE / UPDATE WEBSITE CONTENT
 */
export async function saveWebsiteContent(
  modelKey: string,
  input: {
    visible: boolean;
    data: Record<string, unknown>;
    files?: Record<string, File | null | undefined>;
  },
) {
  const formData = new FormData();

  formData.append("visible", String(input.visible));
  formData.append("data", JSON.stringify(input.data));

  Object.entries(input.files ?? {}).forEach(([fieldname, file]) => {
    if (file instanceof File) {
      formData.append(fieldname, file);
    }
  });

  const response = (await apiClient.upload(
    getWebsiteContentPath(
      ENDPOINTS.SAVE_WEBSITE_CONTENT,
      modelKey,
    ),
    formData,
    {
      method: "PUT",
    },
  )) as WebsiteContentResponse;

  return response.content
    ? normalizeWebsiteContent(response.content)
    : null;
}

/**
 * DELETE WEBSITE CONTENT
 */
export async function deleteWebsiteContent(modelKey: string) {
  return apiClient.delete(
    getWebsiteContentPath(
      ENDPOINTS.DELETE_WEBSITE_CONTENT,
      modelKey,
    ),
  );
}
