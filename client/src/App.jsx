import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider } from 'react-query';
// import Checkout from './pages/orders/Checkout';
// import OrderSuccess from './pages/orders/OrderSuccess';
// import ShipperOrders from './pages/orders/ShipperOrders';

// <Route path="/checkout" element={<Checkout />} />
// <Route path="/orders/success" element={<OrderSuccess />} />
// <Route path="/shipper/orders" element={<ShipperOrders />} />

const routes = [
    {
        path: "",
        element: <Layout />,
        children: [
            {
                path: "/profile",
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
