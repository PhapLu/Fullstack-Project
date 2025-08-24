import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";
import LandingPage from "./pages/landingPage/landingPage";
import Filter from "./components/filter/filter";
import DistributionHub from "./pages/distributionHub/DistributionHub";
const routes = [
    {
        path: "",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <LandingPage />,
            },
            {
                path: "/distributionHub",
                element: <DistributionHub />,
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
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
