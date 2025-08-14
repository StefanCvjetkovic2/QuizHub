import http from "./http";

// GET /api/admin/categories
export async function getAdminCategories() {
  const { data } = await http.get("/api/admin/categories");
  return data; // očekujemo listu: [{ id, name }, ...]
}
