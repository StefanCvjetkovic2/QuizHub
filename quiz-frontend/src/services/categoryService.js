// src/services/categoryService.js
import http from "./http";
import { mapCategory } from "../models/categoryModels";

const BASE = "/admin/categories";

// LIST
export async function listCategories() {
  const { data } = await http.get(BASE);
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.map(mapCategory);
}

// CREATE
export async function createCategory(name) {
  const payload = { name: String(name ?? "").trim() };
  const { data } = await http.post(BASE, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return mapCategory(data);
}

// (opciono) UPDATE
export async function updateCategory(id, name) {
  const payload = { id: Number(id), name: String(name ?? "").trim() };
  const { data } = await http.put(`${BASE}/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return mapCategory(data);
}

// (opciono) DELETE
export async function deleteCategory(id) {
  await http.delete(`${BASE}/${id}`);
}
