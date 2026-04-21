import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import api from "../../services/api"

import mountainImg from "../../assets/images/mountains.png";
import Logo from "../../assets/images/logo2.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 Auto redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  // 🔐 Handle Login (BACKEND INTEGRATED)
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;

      if (!token) {
        throw new Error("Token not received");
      }

      // ✅ SAVE TO STORE + LOCALSTORAGE
      login({
        token,
        user: {
          email,
          role: "ADMIN",
        },
      });

      localStorage.setItem("token", token);

      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        alert("Invalid credentials");
      } else {
        alert("Server error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex relative">
        <img
          src={mountainImg}
          alt="Travel"
          className="w-[550px] h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-3xl font-semibold mb-3">
            Manage Yaritrip Platform
          </h1>
          <p className="text-sm text-gray-200 mb-6 leading-relaxed">
            Access the admin dashboard to manage bookings, users,
            <br /> packages and travel operations.
          </p>

          <div className="flex items-center gap-2 text-xs tracking-widest text-gray-300">
            <div className="w-10 h-[1px] bg-gray-300" />
            ADMINISTRATOR PORTAL
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-8">
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src={Logo}
              alt="logo"
              className="w-[140px] mx-auto object-contain"
            />
            <h2 className="text-xl font-semibold mt-2">Admin Login</h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@yaritrip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Authorized personnel only.
            </p>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-6">
            © 2026 YariTrip Admin System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;