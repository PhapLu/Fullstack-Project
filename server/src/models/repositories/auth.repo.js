// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import { minLength } from "../../utils/validator";

const removeAccents = (str) => {
  return str
    .normalize("NFD") // remove accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9]/g, ""); // remove special characters and spaces
};

function isAllowedEmail(email) {
  return (
    typeof email === "string" && email.toLowerCase().endsWith("@gmail.com")
  );
}

function isValidPassword(password) {
  return minLength(password, 6) && hasDigit(password) && hasSymbol(password);
}

export { removeAccents, isAllowedEmail, isValidPassword };
