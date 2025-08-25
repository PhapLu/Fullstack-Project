// import axios from "axios";

// const api = axios.create({
//   baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

// export default api;   


import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Named helpers: trả về .data để dùng gọn trong component ---
export const apiGet = (url, params) =>
  api.get(url, { params }).then((r) => r.data);

export const apiPost = (url, body) =>
  api.post(url, body).then((r) => r.data);

export const apiPatch = (url, body) =>
  api.patch(url, body).then((r) => r.data);

// (tuỳ chọn) bổ sung nếu cần
export const apiPut = (url, body) =>
  api.put(url, body).then((r) => r.data);

export const apiDelete = (url, params) =>
  api.delete(url, { params }).then((r) => r.data);

// Aliases để tương thích với nơi đang dùng getJSON/ postJSON/ patchJSON
export const getJSON = apiGet;
export const postJSON = apiPost;
export const patchJSON = apiPatch;

export default api;
