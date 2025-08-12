import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider } from 'react-query';

const routes = [
    {
        path: "",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <ProfileLayout />,
            },
        ],
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
