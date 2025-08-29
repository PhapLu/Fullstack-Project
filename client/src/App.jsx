import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import LandingPage from "./pages/landingPage/landingPage";
import DistributionHub from "./pages/distributionHub/DistributionHub";
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import VendorProfile from "./pages/profile/vendorProfile/VendorProfile.jsx"
import OrdersLayout from "./pages/orders/OrdersLayout";
import OrderSuccess from "./pages/orders/OrderSuccess";
import { CartProvider } from "./store/cart/CartContext";
import ShipperProfile from "./pages/profile/ShipperProfile/ShipperProfile.jsx";
import CheckoutPage from "./pages/orders/CheckoutPage.jsx";
import VendorDashboard from "./pages/vendorDashboard/VendorDashboard.jsx"
import SignIn from "./pages/auth/signIn/SignIn";
import SignUp from "./pages/auth/signUp/SignUp";
import VerifyOtp from "./pages/auth/verifyOtp/VerifyOtp.jsx";

const routes = [
    {
        path: "",
        element: <Layout />,
        children: [ 
            {
                path: "/",
                element: <LandingPage />,
            },
            {
                path: "/distributionHub",
                element: <DistributionHub />, 
            },
            {
                path: "/distributionHub/:id",
                element: <DistributionHub />, 
            },
            // http://localhost:5173/distributionHub/A002?role=shipper
            // http://localhost:5173/distributionHub/A002?role=customer
            {
                path: '/vendorprofile',
                element: <VendorProfile />,
            },
            {
                path: '/vendordashboard',
                element: <VendorDashboard />,
            },
            {
            path: "/orders",
            element: <OrdersLayout />,
            children: [
              { index: true, element: <Navigate to="shipper" replace /> },

              { path: "success", element: <OrderSuccess /> },

              { path: "checkout", element: <CheckoutPage /> },
            ],
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
            { path: "otp", element: <VerifyOtp />}
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
