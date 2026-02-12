import api from "@/lib/api";

export async function getApps() {
  const res = await api.get("/apps");
  return res.data;
}

export async function createApp(payload) {
  const res = await api.post("/apps", payload);
  return res.data;
}

export async function getApp(id) {
  const res = await api.get(`/apps/${id}`);
  return res.data;
}

export async function rotateApiKey(id) {
  const res = await api.post(`/apps/${id}/rotate`);
  return res.data;
}

export async function deleteApp(id) {
  const res = await api.delete(`/apps/${id}`);
  return res.data;
}
