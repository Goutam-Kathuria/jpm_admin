const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:7000/jpm";
const ADMIN_SESSION_STORAGE_KEY = "jpmAdminSession";

export interface AdminSession {
  token: string;
  baseUrl: string;
  displayName: string;
}

interface StoredAdminSession {
  token?: string;
  baseUrl?: string;
  displayName?: string;
}

interface RequestAdminApiOptions {
  session?: Partial<AdminSession> | null;
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string) {
  return `${stripTrailingSlash(baseUrl)}/${path.replace(/^\/+/, "")}`;
}

export function getDefaultAdminApiBaseUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  const isLocalDev = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  if (isLocalDev) {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  return "/jpm";
}

export function resolveAdminApiBaseUrl(value?: string | null) {
  const envBaseUrl = normalizeText(
    import.meta.env.VITE_ADMIN_API_BASE_URL ??
      import.meta.env.VITE_API_BASE_URL,
  );

  return stripTrailingSlash(
    normalizeText(value) || envBaseUrl || getDefaultAdminApiBaseUrl(),
  );
}

export function createAdminSession(input: {
  token: string;
  baseUrl?: string;
  displayName?: string;
}): AdminSession {
  const token = normalizeText(input.token);

  if (!token) {
    throw new Error("Admin token is required.");
  }

  return {
    token,
    baseUrl: resolveAdminApiBaseUrl(input.baseUrl),
    displayName: normalizeText(input.displayName) || "Admin",
  };
}

export function loadStoredAdminSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as StoredAdminSession;

    if (!normalizeText(parsed.token)) {
      return null;
    }

    return createAdminSession({
      token: parsed.token ?? "",
      baseUrl: parsed.baseUrl,
      displayName: parsed.displayName,
    });
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

function resolveRequestSession(sessionOverride?: Partial<AdminSession> | null) {
  const storedSession = loadStoredAdminSession();
  const token =
    normalizeText(sessionOverride?.token) ||
    normalizeText(storedSession?.token);

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  return createAdminSession({
    token,
    baseUrl: sessionOverride?.baseUrl ?? storedSession?.baseUrl,
    displayName: sessionOverride?.displayName ?? storedSession?.displayName,
  });
}

export function resolveAdminAssetUrl(assetPath: string, baseUrl: string) {
  const normalizedAssetPath = normalizeText(assetPath);

  if (!normalizedAssetPath || typeof window === "undefined") {
    return normalizedAssetPath;
  }

  try {
    const absoluteBaseUrl = new URL(baseUrl, window.location.origin).toString();
    return new URL(normalizedAssetPath, absoluteBaseUrl).toString();
  } catch {
    return normalizedAssetPath;
  }
}

export async function requestAdminApi<T>(
  path: string,
  init: RequestInit = {},
  options: RequestAdminApiOptions = {},
) {
  const session = resolveRequestSession(options.session);
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${session.token}`);

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(joinUrl(session.baseUrl, path), {
    ...init,
    headers,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
        ? responseData.message
        : response.statusText || "Request failed.";

    throw new Error(message);
  }

  return { data: responseData as T, session };
}
