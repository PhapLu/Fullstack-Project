import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlices";
import authReducer from "./slices/authSlices";
import orders from './slices/orderSlices';


export const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
        orders,
    },
    // middleware: (getDefault) => getDefault().concat(/* custom middleware here */),
});

export default store;
