// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

export const isFilled = (val) =>
  val !== null &&
  val !== undefined &&
  (typeof val !== "string" || val.trim() !== "");

export const minLength = (val, length) => (val ?? "").trim().length >= length;

export function maxLength(val, length) {
  return val.length < length;
}

export const isMatch = (a, b) => a === b;

export function minValue(val, min) {
  return val >= min;
}

export function maxValue(val, max) {
  return val <= max;
}

export function hasSymbol(val) {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(val);
}

export const isValidEmail = (val) => /\S+@\S+\.\S+/.test((val ?? "").trim());
export const isValidUsername = (val) =>
  /^[A-Za-z0-9]{8,15}$/.test((val ?? "").trim());

export function isValidPhone(val) {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  return phoneRegex.test(val);
}

export function hasDigit(val) {
  return /[0-9]/.test(val);
}

export const isValidPassword = (password) => {
  const p = (password ?? "").trim();
  return /^(?=.{8,20}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(
    p
  );
};

export function isInRange(number, min, max) {
  return number >= min && number <= max;
}

export const isValidYouTubeUrl = (url) => {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(&.*)?$/;
  return regex.test(url.trim());
};
