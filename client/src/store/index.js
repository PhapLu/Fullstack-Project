import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlices";
import authReducer from "./slices/authSlices";

export const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
    },
    // middleware: (getDefault) => getDefault().concat(/* custom middleware here */),
});

export default store;
