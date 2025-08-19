import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import { QueryClient, QueryClientProvider } from "react-query";

import AuthLayout from "./pages/auth/authLayout/AuthLayout";
import AuthForm from "./pages/auth/authForm/AuthForm";
import OrderTester from "./pages/orders/OrderTester";

const routes = [
  {
    path: "/",                   // ✅ root path
    element: <Layout />,
    children: [
      { index: true, element: <div style={{ padding: 16 }}>Home</div> },
      { path: "order-test", element: <OrderTester /> }, // ✅ trang test order
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
