// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { newRequest } from "../../utils/newRequest";
import { connectSocket, disconnectSocket } from "../../utils/socketClient";

// Login (cookie will be set by server)
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await newRequest.post("/auth/login", payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Login failed");
    }
  }
);

// Fetch profile
export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await newRequest.get("/user/me");
      return data.user || data.metadata?.user;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Fetch user failed");
    }
  }
);

export const openSocket = createAsyncThunk(
  "auth/openSocket",
  async (_, { getState }) => {
    const userId = getState().auth.user?._id;
    const s = connectSocket(userId); // ✅ pass Redux userId
    return new Promise((resolve) => {
      if (s.readyState === WebSocket.OPEN) {
        return resolve({ connected: true });
      }
      s.onopen = () => resolve({ connected: true });
      s.onerror = () => resolve({ connected: false });
    });
  }
);

const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle",
    error: null,
    socket: { connected: false, id: null },
  },
  reducers: {
    logout: (s) => {
      s.user = null;
      s.status = "idle";
      s.error = null;
      s.socket = { connected: false, id: null };
      disconnectSocket();

      // Clear cart storage for all cases
      Object.keys(localStorage)
        .filter((k) => k.startsWith("bm_cart_v1"))
        .forEach((k) => localStorage.removeItem(k));
    },

    incrementUnseen: (s, a) => {
      if (s.user) {
        s.user.unseenConversations = (s.user.unseenConversations || 0) + 1;
      }
    },
    clearUnseen: (s) => {
      if (s.user) s.user.unseenConversations = 0;
    },
  },
  extraReducers: (b) => {
    b.addCase(signIn.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(signIn.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user || a.payload; // depending on your API response
        if (s.user && typeof s.user.unseenConversations !== "number") {
          s.user.unseenConversations = 0;
        }
      })
      .addCase(signIn.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      .addCase(fetchMe.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload;

        if (typeof s.user.unseenConversations !== "number") {
          s.user.unseenConversations = 0;
        }
      })
      .addCase(fetchMe.rejected, (s, a) => {
        s.status = "failed";
        s.user = null; // 👈 important: mark no user on error
        s.error = a.payload;
      })
      .addCase(openSocket.fulfilled, (s, a) => {
        s.socket = a.payload;
      });
  },
});

export const { logout, incrementUnseen, clearUnseen } = slice.actions;
export const selectAuth = (st) => st.auth;
export const selectUser = (st) => st.auth.user;
export default slice.reducer;
