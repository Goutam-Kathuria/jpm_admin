function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

// API Base URL
// export const BASE_URL = stripTrailingSlash("https://api.jpme.in");
export const BASE_URL = stripTrailingSlash("http://localhost:7000");

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: "/admin/auth/login",

  // Categories
  GET_CATEGORIES: "/admin/categories",
  ADD_CATEGORY: "/admin/categories",
  EDIT_CATEGORY: "/admin/categories/:id",
  DELETE_CATEGORY: "/admin/categories/:id",

  // Products
  GET_PRODUCTS: "/admin/products",
  ADD_PRODUCT: "/admin/products",
  EDIT_PRODUCT: "/admin/products/:id",
  DELETE_PRODUCT: "/admin/products/:id",

  // Gallery
  GET_GALLERY: "/admin/gallery",
  ADD_GALLERY: "/admin/gallery",
  EDIT_GALLERY: "/admin/gallery/:id",
  DELETE_GALLERY: "/admin/gallery/:id",

  // Reviews
  GET_REVIEWS: "/admin/reviews",
  ADD_REVIEW: "/admin/reviews",
  EDIT_REVIEW: "/admin/reviews/:id",
  DELETE_REVIEW: "/admin/reviews/:id",

  // Settings
  GET_SETTINGS: "/admin/settings",
  ADD_SETTING: "/admin/settings",
  EDIT_SETTING: "/admin/settings/:id",
  DELETE_SETTING: "/admin/settings/:id",

  // Website content (CMS sections)
  GET_WEBSITE_CONTENT: "/admin/website-content/:modelKey",
  SAVE_WEBSITE_CONTENT: "/admin/website-content/:modelKey",

  // Inquiries & dashboard
  GET_INQUIRIES: "/admin/inquiries",
  DELETE_INQUIRY: "/admin/inquiries/:id",
  DASHBOARD_SUMMARY: "/admin/dashboard/summary",
};

export default ENDPOINTS;
