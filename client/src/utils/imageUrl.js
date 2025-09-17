// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

const API_BASE = import.meta.env.VITE_SERVER_ORIGIN || "http://localhost:3000";

export const getImageUrl = (path) => {
  if (!path) return "/avatar/default-avatar.png"; // fallback
  if (/^https?:\/\//i.test(path)) return path; // already full URL
  return `${API_BASE}${path}`;
};
