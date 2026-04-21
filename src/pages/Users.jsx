import { useState, useEffect } from "react";
import { FaSearch, FaEllipsisV, FaTimes } from "react-icons/fa";
import api from "../services/api"; // ✅ FIX: IMPORT ADDED

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [filter, setFilter] = useState("All");

  // 🔥 FETCH USERS FROM BACKEND
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");

        const formatted = res.data.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.mobile,
  bookings: u.bookingCount,
  profileImage: u.profileImage, // ✅ ADD THIS
  status: "Active",
  joined: "N/A",
}));

        setUsers(formatted);
      } catch (err) {
        console.error("Users API error:", err);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 FILTER
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "All" || u.status === filter;

    return matchesSearch && matchesFilter;
  });

  // 🔁 TOGGLE STATUS (UI ONLY)
  const toggleStatus = (id) => {
    const updated = users.map((u) =>
      u.id === id
        ? {
            ...u,
            status: u.status === "Active" ? "Inactive" : "Active",
          }
        : u
    );

    setUsers(updated);

    if (selectedUser?.id === id) {
      setSelectedUser((prev) => ({
        ...prev,
        status: prev.status === "Active" ? "Inactive" : "Active",
      }));
    }
  };

  // ❌ DELETE USER (CONNECTED TO BACKEND)
  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);

      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);

      setSelectedUser(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-[1400px] relative">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users Management</h1>
        <p className="text-gray-500 text-sm">
          Manage registered users across the platform.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 w-[260px] border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Users</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-6 text-sm">
          <p>
            <span className="font-semibold">{users.length}</span> Total Users
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">User ID</th>
              <th className="px-6 py-3 text-left">User</th>
              <th>Email</th>
              <th>Phone</th>
              <th className="text-center">Bookings</th>
              <th className="text-center">Status</th>
              <th className="text-center">Joined</th>
              <th className="text-right px-6">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-blue-600">{user.id}</td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
  <img
    src={user.profileImage}
    alt={user.name}
    className="w-9 h-9 rounded-full object-cover"
  />
) : (
  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
    {user.name?.charAt(0)?.toUpperCase()}
  </div>
)}
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>

                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td className="text-center">{user.bookings}</td>

                <td className="text-center">
                  <button onClick={() => toggleStatus(user.id)}>
                    <StatusBadge status={user.status} />
                  </button>
                </td>

                <td className="text-center">{user.joined}</td>

                <td className="px-6 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === user.id ? null : user.id)
                    }
                  >
                    <FaEllipsisV />
                  </button>

                  {openMenu === user.id && (
                    <div className="absolute right-6 mt-2 w-36 bg-white border rounded-lg shadow z-50">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setSelectedUser(null)}
          />

          <div className="w-[420px] bg-white h-full p-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold">User Profile</h2>
            <p className="text-xs text-gray-500 mb-4">
              USER ID: #{selectedUser.id}
            </p>

            <h3 className="text-xl font-semibold mt-3">
              {selectedUser.name}
            </h3>

            <p>{selectedUser.email}</p>
            <p>{selectedUser.phone}</p>

            <div className="mt-6">
              <button
                onClick={() => toggleStatus(selectedUser.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs rounded ${
      status === "Active"
        ? "bg-green-100 text-green-600"
        : "bg-red-100 text-red-600"
    }`}
  >
    {status}
  </span>
);

export default Users;