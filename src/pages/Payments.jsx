import { useState, useEffect } from "react";
import { FaSearch, FaDownload, FaCheckCircle } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const Payments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);

  // 🔥 LOAD FROM BOOKINGS
  useEffect(() => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    const bookings = appData.bookings || [];

    const formatted = bookings.map((b, i) => ({
      id: `#TRX-${82910 + i}`,
      bookingId: b.id,
      user: b.user || "User",
      email: "user@example.com",
      destination: b.destination || "-",
      amount: Number(b.amount || 0),
      method: b.method || ["Visa **** 4421", "UPI - GPay", "PayPal"][i % 3],
      date: b.date || "2023-10-12",
      status:
        b.status === "Confirmed"
          ? "Paid"
          : b.status === "Pending"
            ? "Pending"
            : b.status === "Cancelled"
              ? "Refunded"
              : "Failed",
    }));

    setPaymentsData(formatted);
  }, []);

  // 🔍 FILTER
  const filteredPayments = paymentsData.filter((p) => {
    const matchesSearch =
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || p.status === statusFilter;

    const matchesMethod =
      methodFilter === "All" ||
      p.method.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // 💰 CALCULATIONS
  const totalRevenue = paymentsData
    .filter((p) => p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = paymentsData
    .filter((p) => p.status === "Pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const refundedAmount = paymentsData
    .filter((p) => p.status === "Refunded")
    .reduce((acc, p) => acc + p.amount, 0);

  const successfulTransactions = paymentsData.filter(
    (p) => p.status === "Paid",
  ).length;

  // 📊 EXPORT
  const handleExport = () => {
    const data = filteredPayments.map((p) => ({
      ID: p.id,
      User: p.user,
      Destination: p.destination,
      Amount: p.amount,
      Status: p.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payments.xlsx");
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-xl font-semibold mb-6">Payments Management</h1>

      {/* FINANCIAL OVERVIEW */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-1">Financial Overview.</h2>
        <p className="text-sm text-gray-500 mb-4">
          Track all booking payments, refunds, and transactions.
        </p>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={totalRevenue} />
          <StatCard title="Pending Payments" value={pendingAmount} />
          <StatCard title="Refunded Amount" value={refundedAmount} />
          <StatCard
            title="Successful Transactions"
            value={successfulTransactions}
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between items-center">
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="All">Status: All</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Refunded</option>
            <option>Failed</option>
          </select>

          <select
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="All">Method: All</option>
            <option>Visa</option>
            <option>UPI</option>
            <option>PayPal</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg"
        >
          <FaDownload /> Export Data
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Payment ID</th>
              <th>User</th>
              <th>Destination</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-right px-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-blue-600">{p.id}</td>

                <td>
                  <p className="font-medium">{p.user}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </td>

                <td>{p.destination}</td>

                <td>₹{p.amount.toLocaleString()}</td>

                <td>{p.method}</td>

                <td>{p.date}</td>

                <td>
                  <StatusBadge status={p.status} />
                </td>

                <td className="text-right px-6">
                  <button onClick={() => setSelectedPayment(p)}>•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold">{selectedPayment.user}</h2>
            <p className="mb-2">₹{selectedPayment.amount}</p>
            <button
              onClick={() => setSelectedPayment(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// STAT CARD
const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-lg font-semibold">₹{Number(value).toLocaleString()}</h2>
  </div>
);

// STATUS BADGE
const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Refunded: "bg-blue-100 text-blue-600",
    Failed: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Payments;
