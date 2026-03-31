import React, { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navbar from "./components/navbar";
import "./index.css";
import { fetchCart, syncCartDb } from "./context/features/cart/cartSlice";
import AdminOverview from "./pages/admin/AdminProducts";

// Lazy loading pages
const NewArrival = lazy(() => import("./pages/NewArrival"));
const Kohinoor = lazy(() => import("./pages/Kohinoor"));
const CustomerFav = lazy(() => import("./pages/CustomerFav"));
const FlossieExecutive = lazy(() => import("./pages/FlossieExecutive"));
const Safeera = lazy(() => import("./pages/Safeera"));
const Velvet = lazy(() => import("./pages/Velvet"));
const Dastaan = lazy(() => import("./pages/Dastaan"));
const Shopall = lazy(() => import("./pages/Shopall"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));

const PageLoader = () => <LoadingSpinner fullPage />;

function App() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      const hasSynced = sessionStorage.getItem("cart_synced");
      const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];

      if (localItems.length > 0 && !hasSynced) {
        dispatch(syncCartDb(localItems)).then(() => {
          sessionStorage.setItem("cart_synced", "true");
        });
      } else {
        dispatch(fetchCart());
      }
    } else {
      sessionStorage.removeItem("cart_synced");
    }
  }, [user, dispatch]);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}
      <div className={`min-h-screen ${isAdminPage ? "" : "bg-white"}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public/Authenticated Routes */}
            <Route
              path="/login"
              element={
                !user ? (
                  <Login />
                ) : user.role === "admin" || user.role === "manager" ? (
                  <Navigate to="/admin" />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/" />}
            />
            <Route
              path="/forgot-password"
              element={!user ? <ForgotPassword /> : <Navigate to="/" />}
            />

            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/new-arrival"
              element={user ? <NewArrival /> : <Navigate to="/login" />}
            />
            <Route
              path="/kohinoor"
              element={user ? <Kohinoor /> : <Navigate to="/login" />}
            />
            <Route
              path="/customer-fav"
              element={user ? <CustomerFav /> : <Navigate to="/login" />}
            />
            <Route
              path="/flossie-executive"
              element={user ? <FlossieExecutive /> : <Navigate to="/login" />}
            />
            <Route
              path="/safeera"
              element={user ? <Safeera /> : <Navigate to="/login" />}
            />
            <Route
              path="/velvet"
              element={user ? <Velvet /> : <Navigate to="/login" />}
            />
            <Route
              path="/dastaan"
              element={user ? <Dastaan /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop-all"
              element={user ? <Shopall /> : <Navigate to="/login" />}
            />
            <Route
              path="/product/:id"
              element={user ? <ProductDetails /> : <Navigate to="/login" />}
            />
            <Route
              path="/checkout"
              element={user ? <Checkout /> : <Navigate to="/login" />}
            />
            <Route
              path="/order-status"
              element={user ? <OrderStatus /> : <Navigate to="/login" />}
            />

            <Route
              path="/admin"
              element={
                user && (user.role === "admin" || user.role === "manager") ? (
                  <AdminLayout />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<AdminOverview />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Backward compatibility for /dashboard */}
            <Route path="/dashboard" element={<Navigate to="/admin" />} />

            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
