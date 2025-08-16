import http from "./http";

export async function submitResult(payload) {
  const { data } = await http.post("/api/Results", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function getResultById(id) {
  const { data } = await http.get(`/api/Results/${id}`);
  return data;
}
