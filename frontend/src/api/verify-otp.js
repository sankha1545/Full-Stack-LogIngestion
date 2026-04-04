import api from "@/api/api";

export async function verifyOtp(payload) {
  const response = await api.post("/auth/verify-otp", payload);
  return response.data;
}