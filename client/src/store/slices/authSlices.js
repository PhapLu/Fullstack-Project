import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Example async (swap with your real API)
export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            // const res = await api.post("/login", credentials);
            // return res.data;
            await new Promise((r) => setTimeout(r, 500));
            return {
                user: { id: "123", name: "Pastal User" },
                token: "demo-token",
            };
        } catch (err) {
            return rejectWithValue(err.message || "Login failed");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: { user: null, token: null, status: "idle", error: null },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Login failed";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
