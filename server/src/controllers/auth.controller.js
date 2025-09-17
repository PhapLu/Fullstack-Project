// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import AuthService from "../services/auth.service.js";
import { CREATED, SuccessResponse } from "../core/success.response.js";
import { BadRequestError } from "../core/error.response.js";

class AuthController {
  login = async (req, res, next) => {
    try {
      const { metadata, code } = await AuthService.login(req.body);
      // If sign up was successful and tokens were generated
      res.cookie("accessToken", metadata.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // false in dev (http)
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Sending response
      new SuccessResponse({
        message: "Login successfully",
        metadata,
      }).send(res);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  };

  logout = async (req, res, next) => {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/", // Optional but recommended
      })
      .status(200)
      .send("Logged out successfully");
  };

  signUp = async (req, res, next) => {
    try {
      const { metadata, code } = await AuthService.signUp(req.body);

      // Sending response
      new CREATED({
        message: "Sign up successfully",
        metadata,
      }).send(res);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const { metadata, code } = await AuthService.verifyOtp(req.body);

      // If OTP verification was successful and tokens were generated
      if (code === 200 && metadata.user && metadata.user.accessToken) {
        const { accessToken } = metadata.user;

        // Setting accessToken in a cookie
        res.cookie("accessToken", accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 * 30, // 1 month
        });
      }

      // Sending response
      new SuccessResponse({
        message: "OTP verified successfully",
        metadata,
      }).send(res);
    } catch (error) {
      next(error); // Pass error to error handler middleware
    }
  };

  forgotPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Password reset link sent successfully",
      metadata: await AuthService.forgotPassword(req.body),
    }).send(res);
  };

  verifyResetPasswordOtp = async (req, res, next) => {
    new SuccessResponse({
      message: "OTP verified successfully",
      metadata: await AuthService.verifyResetPasswordOtp(req.body),
    }).send(res);
  };
  resetPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Password changed successfully",
      metadata: await AuthService.resetPassword(req.body),
    }).send(res);
  };
}

export default new AuthController();
