const API_BASE = import.meta.env.VITE_SERVER_ORIGIN || "http://localhost:3000";

export const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png"; // fallback
    if (/^https?:\/\//i.test(path)) return path; // already full URL
    return `${API_BASE}${path}`;
};