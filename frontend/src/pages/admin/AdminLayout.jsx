import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../context/features/user/userSlice";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isManager = user?.role === "manager";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    { title: "Products", icon: <Package size={18} />, path: "/admin/products" },
    ...(!isManager
      ? [
          {
            title: "Orders",
            icon: <ShoppingBag size={18} />,
            path: "/admin/orders",
          },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const NavLinks = ({ onClick }) => (
    <>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.title}
            to={item.path}
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              active
                ? "bg-stone-900 text-white shadow-lg"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {item.title}
              </span>
            </div>
            {active && <ChevronRight size={14} />}
          </Link>
        );
      })}

      <div className="h-px bg-stone-100 my-4 mx-2" />

      <Link
        to="/"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all duration-200"
      >
        <ExternalLink size={18} />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Visit Store
        </span>
      </Link>
    </>
  );

  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col shrink-0">
        <div className="p-8 border-b border-stone-100">
          <h1 className="text-xl font-serif tracking-[0.2em] font-bold text-stone-900 leading-none">
            FLOSSIE
          </h1>
          <p
            className="text-[10px] uppercase tracking-widest mt-2 font-bold"
            style={{ color: isManager ? "#d97706" : "#a8a29e" }}
          >
            {isManager ? "Manager Panel" : "Admin Panel"}
          </p>
          Yeh fix karo aur product routes share karo — last step yahi hai.
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Logout Session
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-stone-100 h-14 flex items-center justify-between px-4">
        <div>
          <h1 className="text-sm font-serif tracking-[0.2em] font-bold text-stone-900">
            FLOSSIE
          </h1>
          <p
            className="text-[10px] uppercase tracking-widest mt-2 font-bold"
            style={{ color: isManager ? "#d97706" : "#a8a29e" }}
          >
            {isManager ? "Manager Panel" : "Admin Panel"}
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
      </div>

      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-serif tracking-[0.2em] font-bold text-stone-900 leading-none">
                  FLOSSIE
                </h1>
                <p
                  className="text-[7px] uppercase tracking-widest leading-none font-bold"
                  style={{ color: isManager ? "#d97706" : "#a8a29e" }}
                >
                  {isManager ? "Manager Panel" : "Admin Panel"}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
              <NavLinks onClick={() => setDrawerOpen(false)} />
            </nav>

            <div className="p-4 border-t border-stone-100">
              <button
                onClick={() => {
                  handleLogout();
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Logout Session
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 overflow-y-auto bg-stone-50">
        <div className="pt-14 md:pt-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
