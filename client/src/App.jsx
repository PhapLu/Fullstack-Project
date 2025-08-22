import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider } from 'react-query';
import OrderList from "./pages/orders/OrderList";
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";
import VendorProfile from "./pages/profile/profileLayout/vendorProfile/VendorProfile"

const routes = [
    {
        path: "",
        element: <Layout />,
        children: [ 
            {
                path: "",
                element: <VendorProfile />,
            },

            {
              path: '/orders',
              element: <OrderList/>
            }
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
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
