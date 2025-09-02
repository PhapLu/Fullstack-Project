import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import LandingPage from "./pages/landingPage/LandingPage";
import DistributionHub from "./pages/distributionHub/DistributionHub";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import VendorProfile from "./pages/profile/vendorProfile/VendorProfile.jsx";
import OrdersLayout from "./pages/orders/OrdersLayout";
import OrderSuccess from "./pages/orders/OrderSuccess";
import { CartProvider } from "./store/cart/CartContext";
import CheckoutPage from "./pages/orders/CheckoutPage.jsx";
import VendorDashboard from "./pages/vendorDashboard/VendorDashboard.jsx";
import SignIn from "./pages/auth/signIn/SignIn";
import SignUp from "./pages/auth/signUp/SignUp";
import VerifyOtp from "./pages/auth/verifyOtp/VerifyOtp.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminHubs from "./pages/admin/AdminHubs.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import UserProfile from "./pages/profile/UserProfile/UserProfile";
import MyCart from "./pages/orders/MyCart/MyCart";
import ProductDetail from "./pages/product/ProductDetail.jsx";

const routes = [
    {
        path: "",
        element: <Layout withFilter />,
        children: [{ path: "/", element: <LandingPage /> }],
    },
    {
        path: "",
        element: <Layout />,
        children: [
            {
                path: "/cart",
                element: <MyCart />,
            },
            {
                path: "/distributionHub/:distributionHubId",
                element: <DistributionHub />,
            },
            {
                path: "/vendor/:profileId",
                element: <VendorProfile />,
            },
            {
                path: "/user/:profileId",
                element: <UserProfile />,
            },
            {
                path: "/vendordashboard",
                element: <VendorDashboard />,
            },
            {
                path: "user/:profileId/order-history",
                element: <OrdersLayout />,
            },
			{
                path: "/payment-success",
                element: <OrderSuccess />,
            },

			{
                path: "/checkout",
                element: <CheckoutPage />,
            },
            {
                path: "/order-success",
                element: <Navigate to="/orders/success" replace />,
            },
            {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminOverview /> },
                    { path: "users", element: <AdminUsers /> },
                    { path: "products", element: <AdminProducts /> },
                    { path: "orders", element: <AdminOrders /> },
                    { path: "hubs", element: <AdminHubs /> },
                ],
            },
            {
                path: "/product/:productId",
                element: <ProductDetail />,
            },
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="signin/customer" replace /> },
            { path: "signin/:role", element: <SignIn /> },
            { path: "signup/:role", element: <SignUp /> },
            { path: "otp", element: <VerifyOtp /> },
        ],
    },
];

const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                <RouterProvider router={router} />
            </CartProvider>
        </QueryClientProvider>
    );
}
