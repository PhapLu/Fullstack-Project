import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import LandingPage from "./pages/landingPage/landingPage";
import DistributionHub from "./pages/distributionHub/DistributionHub";
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";
import VendorProfile from "./pages/profile/vendorProfile/VendorProfile.jsx"
import OrdersLayout from "./pages/orders/OrdersLayout";
import OrderSuccess from "./pages/orders/OrderSuccess";
import { CartProvider } from "./store/cart/CartContext";
import ShipperProfile from "./pages/profile/ShipperProfile/ShipperProfile.jsx";
import CheckoutPage from "./pages/orders/CheckoutPage.jsx";

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
                path: '/vendorprofile',
                element: <VendorProfile />,
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
        path: '/auth/:mode/:role',
        element: <AuthLayout />,
         children: [
            {
                path: "/auth/:mode/:role",
                element: <AuthForm />,
            },
        ],
    }
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
