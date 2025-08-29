import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { newRequest } from "../../utils/newRequest";
import { connectSocket, disconnectSocket } from "../../utils/socketClient";

// --- Thunks ---
export const signUp = createAsyncThunk(
    "auth/signUp",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await newRequest.post(
                "/auth/register",
                payload
            );
            return data.metadata; // { user, token }
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.message || "Sign up failed"
            );
        }
    }
);

export const signIn = createAsyncThunk(
    "auth/signIn",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await newRequest.post(
                "/auth/login",
                payload
            );
            return data.metadata; // { user, token }
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || "Login failed");
        }
    }
);

export const fetchMe = createAsyncThunk(
    "auth/me",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const { data } = await newRequest.get("/user/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data.metadata.user;
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
        const { token } = getState().auth;
        const s = connectSocket(token);
        return new Promise((resolve) => {
            if (s.connected) return resolve({ connected: true, id: s.id });
            s.once("connect", () => resolve({ connected: true, id: s.id }));
            s.once("connect_error", () =>
                resolve({ connected: false, id: null })
            );
        });
    }
);

// --- Slice ---
const slice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null,
        status: "idle",
        error: null,
        socket: { connected: false, id: null },
    },
    reducers: {
        setToken: (s, a) => {
            s.token = a.payload;
        },
        logout: (s) => {
            s.user = null;
            s.token = null;
            s.status = "idle";
            s.error = null;
            s.socket = { connected: false, id: null };
            disconnectSocket();
            localStorage.removeItem("token");
        },
    },
    extraReducers: (b) => {
        b.addCase(signUp.pending, (s) => {
            s.status = "loading";
            s.error = null;
        })
            .addCase(signUp.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.user = a.payload.user;
                s.token = a.payload.token;
            })
            .addCase(signUp.rejected, (s, a) => {
                s.status = "failed";
                s.error = a.payload;
            })

            .addCase(signIn.pending, (s) => {
                s.status = "loading";
                s.error = null;
            })
            .addCase(signIn.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.user = a.payload.user;
                s.token = a.payload.token;
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

export const { logout, setToken } = slice.actions;
export const selectAuth = (st) => st.auth;
export const selectUser = (st) => st.auth.user;
export const selectIsAuthed = (st) => Boolean(st.auth.token);
export const selectSocketInfo = (st) => st.auth.socket;
export default slice.reducer;
