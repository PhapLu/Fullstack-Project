import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { newRequest } from "../../utils/newRequest";
import { connectSocket, disconnectSocket } from "../../utils/socketClient";

// Login (cookie will be set by server)
export const signIn = createAsyncThunk(
    "auth/signIn",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await newRequest.post("/auth/login", payload);
            return data; // maybe return { success: true } or { metadata: { user } }
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
            return rejectWithValue(
                e.response?.data?.message || "Fetch user failed"
            );
        }
    }
);

export const openSocket = createAsyncThunk(
    "auth/openSocket",
    async (_, { getState }) => {
        const s = connectSocket(); // no need to pass token, cookie auth will handle it if your socket handshake checks cookies
        return new Promise((resolve) => {
            if (s.connected) return resolve({ connected: true, id: s.id });
            s.once("connect", () => resolve({ connected: true, id: s.id }));
            s.once("connect_error", () =>
                resolve({ connected: false, id: null })
            );
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
        },
    },
    extraReducers: (b) => {
        b.addCase(signIn.pending, (s) => {
            s.status = "loading";
            s.error = null;
        })
            .addCase(signIn.fulfilled, (s) => {
                s.status = "succeeded";
            })
            .addCase(signIn.rejected, (s, a) => {
                s.status = "failed";
                s.error = a.payload;
            })

            .addCase(fetchMe.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.user = a.payload;
            })
            .addCase(openSocket.fulfilled, (s, a) => {
                s.socket = a.payload;
            });
    },
});

export const { logout } = slice.actions;
export const selectAuth = (st) => st.auth;
export const selectUser = (st) => st.auth.user;
export default slice.reducer;
