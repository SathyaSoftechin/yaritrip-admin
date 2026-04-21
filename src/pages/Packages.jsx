import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

// DEFAULT DATA
const defaultData = [
  {
    id: "PKG-2045",
    name: "Tropical Paradise Getaway",
    location: "Bali, Indonesia",
    country: "Dubai",
    duration: "7 Days, 6 Nights",
    price: "1,299",
    bookings: 458,
    status: "Active",
    updated: "Oct 24, 2023",
  },
  {
    id: "PKG-2047",
    name: "Alpine Winter Special",
    location: "Zermatt, Switzerland",
    country: "Europe",
    duration: "5 Days, 4 Nights",
    price: "1,800",
    bookings: 82,
    status: "Active",
    updated: "Sep 15, 2023",
  },
  {
    id: "PKG-1111",
    name: "Amalfi Coast Tour",
    location: "Italy, Europe",
    country: "Europe",
    duration: "10 Days, 9 Nights",
    price: "2,450",
    bookings: 124,
    status: "Draft",
    updated: "Nov 02, 2023",
  },
  {
    id: "PKG-2046",
    name: "Amalfi Coast Tour",
    location: "Italy, Europe",
    country: "Europe",
    duration: "10 Days, 9 Nights",
    price: "2,450",
    bookings: 124,
    status: "Draft",
    updated: "Nov 02, 2023",
  },
];

const Packages = () => {
  const [search, setSearch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packagesData, setPackagesData] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const location = useLocation();

  const navigate = useNavigate();
  const generatePackageId = (existing = []) => {
    let id;

    do {
      id = `PKG-${Math.floor(1000 + Math.random() * 900000)}`;
    } while (existing.some((pkg) => pkg.id === id));

    return id;
  };
  const normalizePackage = (pkg = {}) => ({
    ...pkg,
    name: pkg.name || "",
    location: pkg.location || "",
    country: pkg.country || "",
    price: Number(pkg.price) || 0,
    bookings: Number(pkg.bookings) || 0,
    description: pkg.description || "",

    // 🔥 IMPORTANT FIX
    images: Array.isArray(pkg.images) ? pkg.images : [],

    hotels: pkg.hotels || [],
    activities: pkg.activities || [],
    itinerary: pkg.itinerary || [],

    duration: pkg.duration || "",
    status: pkg.status || "Draft",
    updated: pkg.updated || new Date().toLocaleDateString(),

    id:
      pkg.id && pkg.id.startsWith("PKG-")
        ? pkg.id
        : `PKG-${Math.floor(1000 + Math.random() * 900000)}`,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/packages");

        const normalized = res.data.map((pkg, index) => ({
          id: pkg.id, // ✅ REAL UUID (IMPORTANT)
          name: pkg.title, // ✅ FIXED
          location: pkg.location,
          duration: `${pkg.nights || 1} Days`, // ✅ FIXED
          price: pkg.price || 0,
          bookings: 0, // ❗ not available yet
          status: "Active", // ❗ default for now
          updated: new Date().toLocaleDateString(),

          // ✅ VERY IMPORTANT FIX
          images: pkg.image ? [`http://localhost:8082${pkg.image}`] : [],
        }));
        setPackagesData(normalized);
      } catch (err) {
        console.error("Packages fetch error:", err);
      }
    };

    fetchPackages();
  }, []);

  // FILTER BY TAB + SEARCH
  const filtered = packagesData.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());

    // ✅ safer filtering
    const matchesTab =
      activeTab === "All" ||
      p.country === activeTab ||
      p.location === activeTab;

    return matchesSearch && matchesTab;
  });

  // ✅ CORRECT PLACE FOR DELETE HANDLER
  const handleDelete = () => {
    if (!deleteModal) return;

    const deleteId = deleteModal.id;

    setDeleteModal(null);

    const updated = packagesData.filter((pkg) => pkg.id !== deleteId);

    setPackagesData(updated);
    localStorage.setItem("packages", JSON.stringify(updated));

    if (selectedPackage?.id === deleteId) {
      setSelectedPackage(null);
    }

    setOpenMenu(null);
  };
  const sorted = [...packagesData].sort(
    (a, b) => new Date(b.updated) - new Date(a.updated),
  );
  useEffect(() => {
    if (location.state?.refresh) {
      const stored = JSON.parse(localStorage.getItem("packages"));
      if (stored) setPackagesData(stored.map(normalizePackage));
    }
  }, [location]);
  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);
  const totalPackages = packagesData.length;

  const activePackages = packagesData.filter(
    (p) => p.status === "Active",
  ).length;

  const totalBookings = packagesData.reduce(
    (sum, p) => sum + (Number(p.bookings) || 0),
    0,
  );

  const totalRevenue = packagesData.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.bookings) || 0),
    0,
  );

  // percentage for active
  const activePercentage =
    totalPackages > 0 ? Math.round((activePackages / totalPackages) * 100) : 0;
  const dynamicTabs = [
    "All",
    ...new Set(
      packagesData
        .map((pkg) => pkg.location) // 👈 use location (Hyderabad, Vizag)
        .filter(Boolean),
    ),
  ];
  const imgs = selectedPackage?.images || [];

  const displayImages = [imgs[0], imgs[1] || imgs[0], imgs[2] || imgs[0]];
  const toggleStatus = (id) => {
    const updated = packagesData.map((pkg) => {
      if (pkg.id === id) {
        return {
          ...pkg,
          status: pkg.status === "Active" ? "Inactive" : "Active",
          updated: new Date().toLocaleDateString(),
        };
      }
      return pkg;
    });

    setPackagesData(updated);
    localStorage.setItem("packages", JSON.stringify(updated));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Packages Management</h1>
          <p className="text-gray-500 text-sm">
            Create, edit, and manage travel package
          </p>
        </div>

        <button
          onClick={() => navigate("/packages/create")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg w-full sm:w-auto"
        >
          + Create New Package
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Packages" value={totalPackages} />

        <StatCard
          title="Active"
          value={activePackages}
          extra={`${activePercentage}%`}
        />

        <StatCard
          title="Bookings (MTD)"
          value={totalBookings.toLocaleString()}
        />

        <StatCard title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {dynamicTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 rounded-full text-sm ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 w-full">
        <div className="relative w-full sm:max-w-[300px]">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            className="pl-9 pr-4 py-2 w-full border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-3">
          <thead className="text-gray-500 text-sm">
            <tr>
              <th className="w-[120px] text-left px-4">ID</th>
              <th className="w-[18%] text-left">Package Details</th>
              <th className="w-[12%] text-center">Duration</th>
              <th className="w-[10%] text-center">Price</th>
              <th className="w-[10%] text-center">Bookings</th>
              <th className="w-[10%] text-center">Status</th>
              <th className="w-[12%] text-center">Updated</th>
              <th className="w-[80px] text-right pr-24">Actions</th>
            </tr>
          </thead>

          <tbody>
            {[...filtered]
              .sort((a, b) => new Date(b.updated) - new Date(a.updated))
              .map((p) => (
                <tr
                  key={p.id}
                  className="bg-white hover:bg-gray-50 rounded-xl shadow-sm align-middle transition"
                >
                  {/* ID */}
                  <td
                    className="px-4 py-3 text-left text-blue-600 whitespace-nowrap cursor-pointer"
                    onClick={() => setSelectedPackage(p)}
                  >
                    #{p.id.substring(0, 6)}
                  </td>

                  {/* PACKAGE DETAILS */}
                  <td className="py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images?.[0]}
                        className="w-12 h-10 object-cover rounded"
                      />
                      <div>
                        <p
                          className="font-medium truncate cursor-pointer hover:underline"
                          onClick={() => setSelectedPackage(p)}
                        >
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {p.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* DURATION */}
                  <td className="text-center py-3 whitespace-nowrap">
                    {p.duration}
                  </td>

                  {/* PRICE */}
                  <td className="text-center py-3 whitespace-nowrap">
                    ₹{Number(p.price).toLocaleString()}
                  </td>

                  {/* BOOKINGS */}
                  <td className="text-center py-3 whitespace-nowrap">
                    {p.bookings}
                  </td>

                  {/* STATUS */}
                  <td className="text-center py-3">
                    <div
                      onClick={() => toggleStatus(p.id)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={p.status} />
                    </div>
                  </td>

                  {/* UPDATED */}
                  <td className="text-center py-3 whitespace-nowrap">
                    {p.updated}
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="text-right px-6 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEllipsisV
                      className="cursor-pointer text-gray-600 hover:text-black"
                      onClick={() =>
                        setOpenMenu(openMenu === p.id ? null : p.id)
                      }
                    />

                    {openMenu === p.id && (
                      <div className="absolute right-6 mt-2 w-36 bg-white shadow-lg rounded-lg z-50 border">
                        {
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm"
                            onClick={() =>
                              navigate(`/packages/edit/${p.id}`, {
                                state: { packageData: p },
                              })
                            }
                          >
                            <FaEdit className="text-gray-600" /> Edit
                          </button>
                        }

                        <button
                          onClick={() => {
                            setDeleteModal(p);
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-red-500 w-full text-left text-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= POPUP ================= */}
      {/* ================= FINAL POPUP ================= */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
            {/* HEADER */}
            <div className="p-6 border-b relative">
              <FaTimes
                className="absolute right-6 top-6 cursor-pointer text-gray-400"
                onClick={() => setSelectedPackage(null)}
              />

              <h2 className="text-lg font-semibold">
                Package Details – {selectedPackage.name}
              </h2>
              <p className="text-sm text-gray-500">
                #{selectedPackage.id} • {selectedPackage.location}
              </p>
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto">
              {/* IMAGES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* MAIN IMAGE */}
                <div className="md:col-span-2 h-[220px] sm:h-[300px] bg-gray-200 rounded-xl overflow-hidden">
                  {selectedPackage.images?.length > 0 ? (
                    <img
                      src={displayImages[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                {/* SIDE IMAGES */}
                <div className="flex md:flex-col gap-4">
                  {/* SECOND IMAGE */}
                  <div className="h-[140px] bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={displayImages[1]}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* THIRD IMAGE + COUNT */}
                  <div className="h-[140px] bg-gray-300 rounded-xl relative overflow-hidden">
                    <img
                      src={displayImages[2]}
                      className="w-full h-full object-cover"
                    />

                    {selectedPackage.images?.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{selectedPackage.images.length - 3} Photos
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <InfoBox label="Duration" value={selectedPackage.duration} />
                <InfoBox
                  label="Starts From"
                  value={`₹${selectedPackage.price}`}
                />
                <InfoBox label="Category" value="Luxury Plus" />
                <InfoBox
                  label="Sold"
                  value={`${selectedPackage.bookings} Units`}
                />
              </div>

              {/* CONTENT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="col-span-2 space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Package Description
                    </h3>
                    <p>
                      {selectedPackage.description ||
                        "No description available"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Itinerary Highlights
                    </h3>

                    <ul className="text-sm space-y-2">
                      {selectedPackage.itinerary?.map((day, i) => (
                        <li key={i}>
                          • Day {i + 1}: {day.title || "No title"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-4">
                  {/* Included Section */}
                  <div className="border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Included in Package
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedPackage?.inclusions?.flights && (
                        <span>✈ Flights</span>
                      )}
                      {selectedPackage?.inclusions?.stay && (
                        <span>🏨 Stay</span>
                      )}
                      {selectedPackage?.inclusions?.driver && (
                        <span>🚗 Driver</span>
                      )}
                      {selectedPackage?.inclusions?.meals && (
                        <span>🍽 Meals</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Pricing Summary
                    </h3>

                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Package Price: </span>
                      <span>₹{selectedPackage?.price || 0}</span>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        ALL INCLUSIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal?.id && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 text-center relative shadow-lg">
            {/* CLOSE */}
            <FaTimes
              className="absolute right-4 top-4 text-gray-400 cursor-pointer"
              onClick={() => setDeleteModal(null)}
            />

            {/* ICON */}
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              ✖
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-semibold mb-2">Delete Package?</h2>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteModal.name}</span>? This
              action cannot be undone.
            </p>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTS
const StatCard = ({ title, value, extra }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value}</p>
    {extra && <span className="text-green-500 text-xs">{extra}</span>}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-green-100 text-green-600",
    Inactive: "bg-red-100 text-red-600",
    Draft: "bg-yellow-100 text-yellow-600",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
      {status}
    </span>
  );
};

const InfoBox = ({ label, value }) => (
  <div className="border rounded-xl p-3 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-sm">{value}</p>
  </div>
);

export default Packages;
