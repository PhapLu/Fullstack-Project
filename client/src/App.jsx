import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import { QueryClient, QueryClientProvider } from "react-query";

import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";
import OrderTester from "./pages/orders/OrderTester";
import MyOrder from "./pages/orders/MyOrder.jsx";

import OrdersLayout from "./pages/orders/OrdersLayout.jsx";
import OrderList from "./pages/orders/OrderList.jsx";
import OrderDetail from "./pages/orders/OrderDetail.jsx";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="orders" replace /> },
      { path: "order-test", element: <OrderTester /> },
      { path: "orders", element: <MyOrder /> },
    ],
  },
  {
    path: "auth/:mode/:role",
    element: <AuthLayout />,
    children: [{ index: true, element: <AuthForm /> }],
  },
//   {
//     path: "orders",
//     element: <OrdersLayout />,
//     children: [
//         { index: true, element: <OrderList /> },
//         { path: ":id", element: <OrderDetail /> },
//     ],
//   },
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
