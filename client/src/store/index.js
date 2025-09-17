// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlices";
import authReducer from "./slices/authSlices";
import orders from "./slices/orderSlices";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    orders,
  },
  // middleware: (getDefault) => getDefault().concat(/* custom middleware here */),
});

export default store;
