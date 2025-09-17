// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

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

export const apiGet = (url, params) =>
  api.get(url, { params }).then((r) => r.data);

export const apiPost = (url, body) => api.post(url, body).then((r) => r.data);

export const apiPatch = (url, body) => api.patch(url, body).then((r) => r.data);

export const apiPut = (url, body) => api.put(url, body).then((r) => r.data);

export const apiDelete = (url, params) =>
  api.delete(url, { params }).then((r) => r.data);

export const getJSON = apiGet;
export const postJSON = apiPost;
export const patchJSON = apiPatch;

export default api;
