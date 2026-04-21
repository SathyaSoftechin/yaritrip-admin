import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

const defaultNotifications = {
  email: true,
  sms: false,
  push: true,
  systemUpdates: true,
  bookings: true,
  marketing: false,
};

const AdminProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [admin, setAdmin] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 🔐 Password state
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // ✅ Sync from store
  useEffect(() => {
    if (user) {
      const avatar = user.avatar;

      const isValidImage =
        typeof avatar === "string" &&
        (avatar.startsWith("blob:") ||
          avatar.startsWith("http://") ||
          avatar.startsWith("https://"));

      setAdmin({
        ...user,
        avatar: isValidImage ? avatar : "",
        notifications: user.notifications || defaultNotifications,
      });

      setImgError(false);
    }
  }, [user]);

  // ✅ Handle input
  const handleChange = (field, value) => {
    setAdmin((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // ✅ Toggle notifications
  const toggleNotification = (field) => {
    setAdmin((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications?.[field],
      },
    }));
    setIsDirty(true);
  };

  // ✅ Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      return;
    }

    const preview = URL.createObjectURL(file);

    setAdmin((prev) => ({
      ...prev,
      avatar: preview,
    }));

    setImgError(false);
    setIsDirty(true);
  };

  // ✅ Save profile
  const handleSave = () => {
    setUser(admin);
    setIsDirty(false);
  };

  // 🔐 Handle password input
  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔐 Update password (frontend only for now)
  const handlePasswordUpdate = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      alert("Please fill all fields");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      alert("Passwords do not match");
      return;
    }

    alert("Password updated successfully");
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  // ✅ Avatar renderer
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
          onError={() => setImgError(true)}
        />
      );
    }

    const first = admin?.firstName?.charAt(0)?.toUpperCase() || "YT";
    const last = admin?.lastName?.charAt(0)?.toUpperCase() || "";

    return `${first}${last}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your personal information and account securely.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 border-l-4 border-blue-600 pl-2">
            Personal Information
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow overflow-hidden">
              {renderAvatar()}
            </div>

            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={admin.firstName} onChange={(v) => handleChange("firstName", v)} />
            <Input label="Last Name" value={admin.lastName} onChange={(v) => handleChange("lastName", v)} />
          </div>

          <Input label="Email Address" value={admin.email} onChange={(v) => handleChange("email", v)} full />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number" value={admin.phone} onChange={(v) => handleChange("phone", v)} />
            <Input label="Job Title" value={admin.jobTitle} onChange={(v) => handleChange("jobTitle", v)} />
          </div>

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`mt-6 px-5 py-2 rounded-lg text-white ${
              isDirty ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            Save Changes
          </button>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 border-l-4 border-blue-600 pl-2">
            Notification Preferences
          </h2>

          <Toggle label="Email Notifications" checked={admin.notifications?.email} onChange={() => toggleNotification("email")} />
          <Toggle label="SMS Alerts" checked={admin.notifications?.sms} onChange={() => toggleNotification("sms")} />
          <Toggle label="Push Notifications" checked={admin.notifications?.push} onChange={() => toggleNotification("push")} />
        </div>
      </div>

      {/* 🔐 PASSWORD SECTION */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-lg">
        <h2 className="font-semibold mb-4 border-l-4 border-orange-500 pl-2">
          Change Password
        </h2>

        <Input
          label="Current Password"
          type="password"
          value={passwordData.current}
          onChange={(v) => handlePasswordChange("current", v)}
        />

        <Input
          label="New Password"
          type="password"
          value={passwordData.new}
          onChange={(v) => handlePasswordChange("new", v)}
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={passwordData.confirm}
          onChange={(v) => handlePasswordChange("confirm", v)}
        />

        <button
          onClick={handlePasswordUpdate}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

/* COMPONENTS */

const Input = ({ label, value, onChange, full, type = "text" }) => (
  <div className={`mt-4 ${full ? "col-span-2" : ""}`}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex justify-between items-center py-2">
    <p className="text-sm">{label}</p>
    <input type="checkbox" checked={checked || false} onChange={onChange} />
  </div>
);

export default AdminProfile;