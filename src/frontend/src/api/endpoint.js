// API Base URL
export const BASE_URL = "http://localhost:7000";
// export const BASE_URL = "https://api.jpme.in";

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: "/admin/auth/login",

  // Categories
  ADD_CATEGORY: "/admin/categories/add-category",
  EDIT_CATEGORY: "/admin/categories/edit-category/:id",
  GET_CATEGORIES: "/admin/categories/get-category",
};

export default ENDPOINTS;
