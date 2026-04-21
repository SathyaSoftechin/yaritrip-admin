import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import mountainImg from "../../assets/images/mountains.png";
import Logo from "../../assets/images/logo2.png";

const RegisterAdmin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      return alert("All fields are required");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    alert("Admin registered successfully");
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex relative h-full">
        <img
          src={mountainImg}
          alt="Travel"
          className="w-[550px] h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-10 left-10 text-white max-w-sm">
          <h1 className="text-2xl font-semibold mb-2">
            Join Yaritrip Admin Panel
          </h1>
          <p className="text-sm text-gray-200 mb-4 leading-relaxed">
            Create your admin account to manage bookings, users, packages and
            platform operations.
          </p>

          <div className="flex items-center gap-2 text-xs tracking-widest text-gray-300">
            <div className="w-8 h-[1px] bg-gray-300" />
            ADMIN REGISTRATION
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-12 ml-5">
        {/* SCROLL CONTAINER */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 max-h-[90vh]">
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src={Logo}
              alt="logo"
              className="w-[110px] mx-auto object-contain"
            />

            <h2 className="text-lg font-semibold">Admin Registration</h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@yaritrip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition text-sm"
            >
              Create Admin Account
            </button>

            {/* Login Redirect */}
            {/* <p className="text-xs text-center text-gray-500">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 cursor-pointer font-medium"
              >
                Login
              </span>
            </p> */}

            {/* Note */}
            {/* <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Only authorized personnel can register as admin.
            </p> */}
          </form>

          {/* Footer */}
          {/* <p className="text-[10px] text-gray-400 text-center mt-4">
            © 2026 YariTrip Admin System
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
