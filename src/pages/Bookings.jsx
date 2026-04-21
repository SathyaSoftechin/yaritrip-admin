import { useState, useEffect } from "react";
import { FaSearch, FaEllipsisV, FaTimes } from "react-icons/fa";
import api from "../services/api"; // ✅ FIX ADDED

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState("All");

  // 🔥 LOAD BOOKINGS FROM BACKEND
  // 🔥 LOAD BOOKINGS FROM BACKEND (WITH STATUS FIX)
useEffect(() => {
  const normalizeStatus = (status) => {
    if (!status) return "Pending";

    const s = status.toUpperCase();

    if (s === "CREATED") return "Pending";
    if (s === "CONFIRMED") return "Confirmed";

    return "Pending";
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");

      setBookings(
        (res.data || []).map((b) => ({
          ...b,
          status: normalizeStatus(b.status),
        }))
      );
    } catch (err) {
      console.error("Booking API error:", err);
    }
  };

  fetchBookings();
}, []);
  // 🔍 FILTER
  const filtered = bookings.filter((b) => {
    const matchesSearch = (b.user || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "All" || b.status === filter;

    return matchesSearch && matchesFilter;
  });

  // 🔁 TOGGLE STATUS (UI ONLY)
  const toggleStatus = (id) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        let nextStatus = "Confirmed";

        if (b.status === "Confirmed") nextStatus = "Cancelled";
        else if (b.status === "Cancelled") nextStatus = "Pending";
        else if (b.status === "Pending") nextStatus = "Confirmed";

        return { ...b, status: nextStatus };
      }
      return b;
    });

    setBookings(updated);

    if (selectedBooking?.id === id) {
      setSelectedBooking((prev) => ({
        ...prev,
        status:
          prev.status === "Confirmed"
            ? "Cancelled"
            : prev.status === "Cancelled"
            ? "Pending"
            : "Confirmed",
      }));
    }
  };

  // ❌ DELETE (Frontend only since no API yet)
  const deleteBooking = (id) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    setSelectedBooking(null);
  };

  return (
    <div className="max-w-[1400px] relative">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Booking</h1>
        <p className="text-gray-500 text-sm">
          Manage all bookings across the platform
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
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
            <option value="All">All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <p className="text-sm">
          <span className="font-semibold">{bookings.length}</span> Total
          Bookings
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Booking ID</th>
              <th>User</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right px-6">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-blue-600">{b.id}</td>
                <td>{b.user || "User"}</td>
                <td>{b.destination || "-"}</td>
                <td>{b.date || "-"}</td>
                <td>₹{Number(b.amount || 0).toLocaleString()}</td>

                <td>
                  <button onClick={() => toggleStatus(b.id)}>
                    <StatusBadge status={b.status} />
                  </button>
                </td>

                <td className="text-right px-6 relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === b.id ? null : b.id)
                    }
                  >
                    <FaEllipsisV />
                  </button>

                  {openMenu === b.id && (
                    <div className="absolute right-6 mt-2 w-36 bg-white border rounded-lg shadow z-50">
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setOpenMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => deleteBooking(b.id)}
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
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setSelectedBooking(null)}
          />

          <div className="w-[420px] bg-white h-full p-6 relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold mb-2">
              Booking Details
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              ID: {selectedBooking.id}
            </p>

            <p>
              <b>User:</b> {selectedBooking.user}
            </p>
            <p>
              <b>Destination:</b> {selectedBooking.destination}
            </p>
            <p>
              <b>Date:</b> {selectedBooking.date}
            </p>
            <p>
              <b>Amount:</b> ₹{selectedBooking.amount}
            </p>

            <div className="mt-4">
              <button
                onClick={() =>
                  toggleStatus(selectedBooking.id)
                }
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENT
const StatusBadge = ({ status }) => {
  const styles = {
    Confirmed: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Bookings;