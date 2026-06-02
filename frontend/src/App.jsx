import React, { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import "./index.css";
import { fetchCart, syncCartDb } from "./context/features/cart/cartSlice";

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
const AboutUs = lazy(() => import("./pages/info/AboutUs"));
const ContactUs = lazy(() => import("./pages/info/ContactUs"));
const Faqs = lazy(() => import("./pages/info/Faqs"));
const PrivacyPolicy = lazy(() => import("./pages/info/PrivacyPolicy"));
const ReturnExchange = lazy(() => import("./pages/info/ReturnExchange"));
const DeliveryPolicy = lazy(() => import("./pages/info/DeliveryPolicy"));
const SizeGuide = lazy(() => import("./pages/info/SizeGuide"));
const TermsOfService = lazy(() => import("./pages/info/TermsOfService"));

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
      const localItems = JSON.parse(localStorage.getItem("cart_items")) || [];

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const isAdminPage = location.pathname.startsWith("/admin");
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
    location.pathname
  );

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

            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />
            <Route path="/new-arrival" element={<NewArrival />} />
            <Route path="/kohinoor" element={<Kohinoor />} />
            <Route path="/customer-fav" element={<CustomerFav />} />
            <Route path="/flossie-executive" element={<FlossieExecutive />} />
            <Route path="/safeera" element={<Safeera />} />
            <Route path="/velvet" element={<Velvet />} />
            <Route path="/dastaan" element={<Dastaan />} />
            <Route path="/shop-all" element={<Shopall />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route
              path="/checkout"
              element={user ? <Checkout /> : <Navigate to="/login" />}
            />
            <Route
              path="/order-status"
              element={user ? <OrderStatus /> : <Navigate to="/login" />}
            />
            <Route
              path="/about"
              element={user ? <AboutUs /> : <Navigate to="/login" />}
            />
            <Route
              path="/contact"
              element={user ? <ContactUs /> : <Navigate to="/login" />}
            />
            <Route
              path="/faqs"
              element={user ? <Faqs /> : <Navigate to="/login" />}
            />
            <Route
              path="/privacy-policy"
              element={user ? <PrivacyPolicy /> : <Navigate to="/login" />}
            />
            <Route
              path="/return-exchange"
              element={user ? <ReturnExchange /> : <Navigate to="/login" />}
            />
            <Route
              path="/delivery-policy"
              element={user ? <DeliveryPolicy /> : <Navigate to="/login" />}
            />
            <Route
              path="/size-guide"
              element={user ? <SizeGuide /> : <Navigate to="/login" />}
            />
            <Route
              path="/terms"
              element={user ? <TermsOfService /> : <Navigate to="/login" />}
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
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Backward compatibility for /dashboard */}
            <Route path="/dashboard" element={<Navigate to="/admin" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
      {!isAdminPage && !isAuthPage && <Footer />}
    </>
  );
}

export default App;
