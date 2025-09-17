// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import jwt from "jsonwebtoken";
import { AuthFailureError, BadRequestError } from "../core/error.response.js";
import User from "../models/user.model.js";

// export const verifyToken = (req, res, next) => {
//     let token;

//     const authHeader = req.headers.authorization;

//     // 1. Get token from Authorization header (MOBILE)
//     if (authHeader && authHeader.startsWith("Bearer ")) {
//         token = authHeader.split(" ")[1]; // ❌ NO decryption here
//     } else if (req.cookies?.accessToken) {
//         // 2. Or get token from cookies (WEB)
//         token = decrypt(req.cookies.accessToken); // ✅ Only decrypt cookies
//     } else {
//         return next(new AuthFailureError("Please login to continue"));
//     }

//     // 3. Verify token
//     try {
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = payload.id;
//         req.email = payload.email;
//         next();
//     } catch (err) {
//         console.error("❌ Invalid token:", err.message);
//         return next(new BadRequestError("Invalid token, please login again"));
//     }
// };

export const verifyToken = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  // 1. Get token from Authorization header (MOBILE)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // 2. Or get token from cookies (WEB)
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  // 3. No token found
  else {
    return next(new AuthFailureError("Please login to continue"));
  }

  // 4. Verify token
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.email = payload.email;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return next(new BadRequestError("Invalid token, please login again"));
  }
};

export const getUserFromToken = async (req) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token) return { user: null, userId: null };

    // Decrypt token
    token = decrypt(token);

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id.toString();

    // Fetch user from database (optional)
    const user = await User.findById(userId).select("role");
    if (!user) return { user: null, userId };

    return { user, userId };
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return { user: null, userId: null };
  }
};
