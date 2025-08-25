import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layouts/Layout";
import ProfileLayout from "./pages/profile/profileLayout/ProfileLayout";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import AuthForm from "./pages/auth/authForm/AuthForm";
import AuthLayout from "./pages/auth/authLayout/AuthLayout";

import MyCart from "./pages/orders/MyCart/MyCart.jsx";
import { CartProvider } from "./store/cart/CartContext.jsx";
import ProductDetail from "./pages/product/ProductDetail.jsx";
import CustomerProfile from "./pages/profile/CustomerProfile/CustomerProfile.jsx";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ProfileLayout /> },
      { path: "myCart", element: <MyCart /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  {
    path: "/auth/:mode/:role",
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthForm /> }, 
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
