import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Bookings from "./pages/Bookings";
import AdminLayout from "./layout/AdminLayout";
import Packages from "./pages/Packages";
import ProtectedRoute from "./routes/ProtectedRoute";
import EditPackage from "./pages/EditPackage";
import CreatePackage from "./pages/CreatePackage";
import Payments from "./pages/Payments";
import RegisterAdmin from "./components/auth/RegisterAdmin";
import AdminProfile from "./pages/AdminProfile";

const App = () => {

  // 🔥 INIT CENTRAL DATA
  useEffect(() => {
    const initData = {
      users: [],
      bookings: [],
      packages: [],
    };

    const existingData = JSON.parse(localStorage.getItem("appData"));

    if (!existingData) {
      localStorage.setItem("appData", JSON.stringify(initData));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAdmin />} />

        {/* 🔐 PROTECTED ADMIN */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<Navigate to="dashboard" />} />

          {/* CORE PAGES */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="packages" element={<Packages />} />
          <Route path="packages/edit/:id" element={<EditPackage />} />
          <Route path="packages/create" element={<CreatePackage />} />
          <Route path="payments" element={<Payments />} />

          {/* ✅ FIXED PROFILE ROUTE */}
          <Route path="admin/profile" element={<AdminProfile />} />
        </Route>

        {/* 🚫 FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;