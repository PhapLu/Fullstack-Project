import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";

const routes = [
    {
        path: "", 
        element: <Layout />,
        children: [
            {
                
            },
        ],
    },

    {
        path: "auth/:mode/:role",
        element: <AuthLayout />, 
        children: [{ index: true, element: <AuthForm /> }],
    },

];

const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
