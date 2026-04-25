import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface Setting {
  _id: string;
  email: string;
  displayName: string;
  enquiryEmail: string;
  enquiryPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  hasPassword: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveSettingInput {
  email: string;
  password?: string;
  displayName?: string;
  enquiryEmail: string;
  enquiryPhone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

interface SettingsResponse {
  setting?: Setting | null;
}

function normalizeSetting(setting: Setting): Setting {
  return {
    ...setting,
    email: setting.email ?? "",
    displayName: setting.displayName ?? "Admin",
    enquiryEmail: setting.enquiryEmail ?? "",
    enquiryPhone: setting.enquiryPhone ?? "",
    address: setting.address ?? "",
    facebookUrl: setting.facebookUrl ?? "",
    instagramUrl: setting.instagramUrl ?? "",
    twitterUrl: setting.twitterUrl ?? "",
    linkedinUrl: setting.linkedinUrl ?? "",
    hasPassword: Boolean(setting.hasPassword),
  };
}

function getSettingPath(endpoint: string, id: string) {
  return endpoint.replace(":id", id);
}

export async function getSettings() {
  const response = (await apiClient.get(ENDPOINTS.GET_SETTINGS)) as SettingsResponse;
  return response.setting ? normalizeSetting(response.setting) : null;
}

export async function addSetting(input: SaveSettingInput) {
  const response = (await apiClient.post(
    ENDPOINTS.ADD_SETTING,
    input,
  )) as SettingsResponse;
  return response.setting ? normalizeSetting(response.setting) : null;
}

export async function editSetting(id: string, input: SaveSettingInput) {
  const response = (await apiClient.put(
    getSettingPath(ENDPOINTS.EDIT_SETTING, id),
    input,
  )) as SettingsResponse;
  return response.setting ? normalizeSetting(response.setting) : null;
}

export async function deleteSetting(id: string) {
  return apiClient.delete(getSettingPath(ENDPOINTS.DELETE_SETTING, id));
}
