import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "light",
    loading: false,
    error: null,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setTheme, setLoading, setError, clearError } = appSlice.actions;
export default appSlice.reducer;
