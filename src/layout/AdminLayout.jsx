import {
  FaHome,
  FaUsers,
  FaSuitcase,
  FaBox,
  FaMoneyBill,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo2.png";
import { useAuthStore } from "../store/auth.store";
import { useState } from "react";

// 🔷 MENU CONFIG
const menuItems = [
  { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
  { name: "Users", icon: <FaUsers />, path: "/users" },
  { name: "Bookings", icon: <FaSuitcase />, path: "/bookings" },
  { name: "Packages", icon: <FaBox />, path: "/packages" },
];

const bottomMenu = [
  { name: "Payments", icon: <FaMoneyBill />, path: "/payments" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [imgError, setImgError] = useState(false);

  // ✅ Safe fallback
  const admin = user || {
    firstName: "Admin",
    lastName: "",
    avatar: "",
  };

  // ✅ Avatar renderer (FINAL SAFE VERSION)
  const renderAvatar = () => {
    const avatar = admin?.avatar;

    const isValidImage =
      typeof avatar === "string" &&
      (avatar.startsWith("blob:") ||
        avatar.startsWith("http://") ||
        avatar.startsWith("https://"));

    if (isValidImage && !imgError) {
      return (
        <img
          src={avatar}
          alt="profile"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)} // 🔥 fallback
        />
      );
    }

    // fallback initials
    const first = admin?.firstName?.charAt(0)?.toUpperCase() || "YT";
    const last = admin?.lastName?.charAt(0)?.toUpperCase() || "";

    return `${first}${last}`;
  };

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <img src={Logo} alt="logo" className="w-[140px] object-contain" />
        </div>

        {/* MENU */}
        <div className="flex-1 px-3 py-4 space-y-2 text-sm overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} {...item} />
          ))}

          <p className="text-gray-400 text-xs mt-6 mb-2 px-2">
            FINANCE & TOOLS
          </p>

          {bottomMenu.map((item) => (
            <SidebarItem key={item.name} {...item} />
          ))}
        </div>

        {/* 🔥 LOGOUT BUTTON */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div className="w-1/2 px-4 py-2" />

          {/* PROFILE */}
          <div
            onClick={() => navigate("/admin/profile")}
            className="flex items-center gap-4 cursor-pointer"
          >
            {/* NAME */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {admin?.jobTitle || admin?.role || "Admin"}
              </p>
            </div>

            {/* AVATAR */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold overflow-hidden">
              {renderAvatar()}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// 🔷 Sidebar Item
const SidebarItem = ({ icon, name, path }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{name}</span>
    </NavLink>
  );
};

export default AdminLayout;