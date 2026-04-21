import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    bookings: 0,
    revenue: 0,
    packages: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  const formatNumber = (num) => (num || 0).toLocaleString();

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      // 🔹 Call stats separately (avoid Promise.all issues)
      const statsRes = await api.get("/admin/dashboard");

      // console.log("STATS RESPONSE:", statsRes.data); // debug

      setStats({
  users: statsRes?.data?.totalUsers ?? 0,
  bookings: statsRes?.data?.totalBookings ?? 0,
  revenue: statsRes?.data?.totalRevenue ?? 0,
  packages: statsRes?.data?.totalPackages ?? 0,
});
    } catch (err) {
      console.error("Stats API Error:", err);
    }

    // 🔹 KEEP your other APIs SAME (no UI change)
    try {
      const revenueRes = await api.get("/admin/revenue/monthly");
      setRevenueData(
        (revenueRes.data || []).map((r) => ({
          month: new Date(0, (r.month || 1) - 1).toLocaleString("default", {
            month: "short",
          }),
          value: Number(r.revenue || 0),
        }))
      );
    } catch {}

    try {
      const destRes = await api.get("/admin/bookings/destination");
      const total =
        (destRes.data || []).reduce((sum, d) => sum + (d.count || 0), 0) || 1;

      setDestinationData(
        (destRes.data || []).map((d) => ({
          label: d.destination || "Unknown",
          value: Math.round(((d.count || 0) / total) * 100),
        }))
      );
    } catch {}

    try {
      const recentRes = await api.get("/admin/bookings/recent");
      setRecentBookings(recentRes.data || []);
    } catch {}
  };

  fetchDashboard();
}, []);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-semibold mb-1">Dashboard Overview</h1>
        <p className="text-gray-500 mb-6">
          Welcome back! Here's what's happening today
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value={stats.users} />
        <StatCard title="Bookings" value={stats.bookings} />
        <StatCard
          title="Revenue"
          value={`₹${formatNumber(stats.revenue)}`}
        />
        <StatCard title="Packages" value={stats.packages} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <motion.div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" />
              <Tooltip />
              <Line type="monotone" dataKey="value" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Bookings by Destination</h2>

          {destinationData.map((d, i) => (
            <Destination key={i} label={d.label} value={d.value} />
          ))}
        </motion.div>
      </div>

      <motion.div className="bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Recent Bookings</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Booking ID</th>
              <th>User</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentBookings.map((b, i) => (
              <Row key={i} booking={b} />
            ))}
          </tbody>
        </table>
      </motion.div>
    </>
  );
};

const StatCard = ({ title, value }) => (
  <motion.div className="bg-white p-5 rounded-xl shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-xl font-semibold mt-1">{value}</h2>
  </motion.div>
);

const Destination = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded">
      <motion.div
        className="h-2 bg-blue-500 rounded"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Row = ({ booking }) => {
  const statusColor = {
    Booked: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Failed: "bg-red-100 text-red-600",
  };

  return (
    <tr className="border-b">
      <td className="py-3 text-blue-500">{booking?.id}</td>
      <td>{booking?.user || "User"}</td>
      <td>{booking?.destination || "-"}</td>
      <td>{booking?.date || "-"}</td>
      <td>₹{booking?.amount || 0}</td>
      <td>
        <span
          className={`text-xs px-2 py-1 rounded ${
            statusColor[booking?.status] || "bg-gray-100"
          }`}
        >
          {booking?.status || "Pending"}
        </span>
      </td>
    </tr>
  );
};

export default Dashboard;