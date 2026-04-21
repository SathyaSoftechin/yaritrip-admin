import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelModal from "../components/HotelModal";
import ActivityModal from "../components/ActivityModal";

const CreatePackage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    country: "",
    days: "",
    nights: "",
    description: "",
    price: "",
    discount: "",
    status: true,
    images: [],
    itinerary: [],
    hotels: [],
    activities: [],
    flightIncluded: true,
    airportTransfer: "Included",
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [editingActivityData, setEditingActivityData] = useState(null);

  // IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    const compressedImages = await Promise.all(
      files.map((file) => compressImage(file)),
    );

    setImagePreview((prev) => {
      const updated = [...prev, ...compressedImages].slice(0, 3);
      return updated;
    });

    setForm((prev) => {
      const updated = [...prev.images, ...compressedImages].slice(0, 3);

      return {
        ...prev,
        images: updated,
      };
    });

    // ✅ VERY IMPORTANT
    e.target.value = null;
  };

  // REMOVE HOTEL / ACTIVITY
  const removeItem = (type, index) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // SAVE PACKAGE
  const [isPublishing, setIsPublishing] = useState(false);
  const handlePublish = () => {
    if (!form.name.trim()) return alert("Package name is required");
    if (!form.location.trim()) return alert("Destination is required");
    if (!form.days || !form.nights)
      return alert("Please enter days and nights");
    if (!form.price) return alert("Package price is required");
    if (isNaN(form.price) || Number(form.price) <= 0)
      return alert("Enter a valid price");
    if (form.images.length === 0)
      return alert("Please upload at least one image");
    if (JSON.stringify(form.images).length > 4000000) {
      return alert("Images too large. Please upload smaller images.");
    }

    try {
      setIsPublishing(true);

      let stored = JSON.parse(localStorage.getItem("packages")) || [];

      const newPackage = normalizePackage({
        ...form,
        images: form.images,
        id: `PKG-${Math.floor(1000 + Math.random() * 900000)}`,
        duration: `${form.days} Days, ${form.nights} Nights`,
        price: Number(form.price) || 0,
        bookings: 0,
        updated: new Date().toLocaleDateString(),
      });

      console.log("SAVING PACKAGE:", newPackage);

      localStorage.setItem("packages", JSON.stringify([newPackage, ...stored]));

      setCreatedPackage(newPackage);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Storage Error:", error);
      alert("Storage error occurred");
    } finally {
      setIsPublishing(false);
    }
  };
  console.log("FINAL IMAGES:", form.images);
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");

          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;

          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressed = canvas.toDataURL("image/jpeg", 0.6); // 🔥 compression
          resolve(compressed);
        };
      };

      reader.readAsDataURL(file);
    });
  };
  const normalizePackage = (pkg = {}) => ({
    ...pkg,
    name: pkg.name || "",
    location: pkg.location || "",
    country: pkg.country || "",
    price: Number(pkg.price) || 0,
    bookings: Number(pkg.bookings) || 0,
    description: pkg.description || "",
    images: Array.isArray(pkg.images) ? pkg.images : [],
    hotels: pkg.hotels || [],
    activities: pkg.activities || [],
    itinerary: pkg.itinerary || [],
    duration: pkg.duration || "",
    status: pkg.status ? "Active" : "Draft",
    updated: new Date().toLocaleDateString(),
    id:
      pkg.id && pkg.id.startsWith("PKG-")
        ? pkg.id
        : `PKG-${Math.floor(1000 + Math.random() * 900000)}`,
  });

  const [activeHotelMenu, setActiveHotelMenu] = useState(null);
  const [editingHotelIndex, setEditingHotelIndex] = useState(null);
  const [editingHotelData, setEditingHotelData] = useState(null);
  const [activeActivityMenu, setActiveActivityMenu] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPackage, setCreatedPackage] = useState(null);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-1">Create New Packages</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          {/* BASIC */}
          <div className="bg-white p-5 rounded-xl border">
            <h2 className="font-semibold mb-4">Basic Information</h2>

            <input
              placeholder="Package Name"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <input
              placeholder="Destination"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
            />
            <input
              placeholder="Package Price"
              className="w-full border p-2 rounded mt-3"
              value={form.price}
              onChange={(e) => {
                const value = e.target.value;

                // allow only numbers
                if (/^\d*$/.test(value)) {
                  setForm((prev) => ({ ...prev, price: value }));
                }
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Days"
                className="border p-2 rounded"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, days: e.target.value }))
                }
              />
              <input
                placeholder="Nights"
                className="border p-2 rounded"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nights: e.target.value }))
                }
              />
            </div>

            <textarea
              placeholder="Description"
              className="w-full border p-2 rounded mt-3"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* MEDIA */}
          <div className="bg-white p-5 rounded-xl border">
            <h2 className="font-semibold mb-3">Media</h2>

            <div className="flex gap-3 flex-wrap">
              {imagePreview.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-24 h-20 object-cover rounded"
                />
              ))}

              <label className="w-24 h-20 border flex items-center justify-center cursor-pointer">
                +
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* ITINERARY */}
          {/* ITINERARY */}
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Itinerary</h2>

              <button
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    itinerary: [
                      ...prev.itinerary,
                      {
                        title: "",
                        description: "",
                        activities: [],
                      },
                    ],
                  }))
                }
                className="text-blue-600 text-sm"
              >
                + Add Day
              </button>
            </div>

            <div className="space-y-4">
              {form.itinerary.map((day, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  {/* DAY HEADER */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Day {index + 1}</h3>

                    <button
                      onClick={() => {
                        const updated = [...form.itinerary];
                        updated.splice(index, 1);
                        setForm((prev) => ({ ...prev, itinerary: updated }));
                      }}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {/* TITLE */}
                  <input
                    placeholder="Day Title (e.g., Arrival & Marina Cruise)"
                    className="w-full border p-2 rounded mb-2"
                    value={day.title}
                    onChange={(e) => {
                      const updated = [...form.itinerary];
                      updated[index].title = e.target.value;
                      setForm((prev) => ({ ...prev, itinerary: updated }));
                    }}
                  />

                  {/* DESCRIPTION */}
                  <textarea
                    placeholder="Day Description"
                    className="w-full border p-2 rounded mb-3"
                    value={day.description}
                    onChange={(e) => {
                      const updated = [...form.itinerary];
                      updated[index].description = e.target.value;
                      setForm((prev) => ({ ...prev, itinerary: updated }));
                    }}
                  />

                  {/* ACTIVITIES */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Activities</p>

                    <button
                      onClick={() => {
                        setSelectedDayIndex(index);
                        setShowActivityModal(true);
                      }}
                      className="text-blue-600 text-sm"
                    >
                      + Add Activity
                    </button>
                  </div>

                  {/* ACTIVITY LIST */}
                  <div className="space-y-2">
                    {day.activities.map((act, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white border rounded px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{act.name}</p>
                          <p className="text-xs text-gray-500">
                            ₹{act.price} • {act.duration}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const updated = [...form.itinerary];
                            updated[index].activities = updated[
                              index
                            ].activities.filter((_, idx) => idx !== i);

                            setForm((prev) => ({
                              ...prev,
                              itinerary: updated,
                            }));
                          }}
                          className="text-red-500 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* HOTELS */}
          <div className="bg-white p-5 rounded-xl border mb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Hotels</h2>

              {/* GLOBAL ADD */}
              <button
                onClick={() => setShowHotelModal(true)}
                className="text-blue-600 text-sm"
              >
                + Add
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {form.hotels.map((h, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 relative"
                >
                  {/* HOTEL INFO */}
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{h.roomType}</span>
                      <span>•</span>
                      <span>{h.nights} Nights</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        ⭐ {h.starRating}
                      </span>
                    </p>
                  </div>

                  {/* THREE DOT MENU */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveHotelMenu(activeHotelMenu === i ? null : i)
                      }
                      className="text-gray-500 text-lg px-2"
                    >
                      ⋮
                    </button>

                    {/* DROPDOWN */}
                    {activeHotelMenu === i && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow z-10">
                        {/* ADD */}
                        <button
                          onClick={() => {
                            setShowHotelModal(true);
                            setActiveHotelMenu(null);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Add
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => {
                            navigate(`/packages/edit/temp`, {
                              state: { packageData: form },
                            });
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => {
                            removeItem("hotels", i);
                            setActiveHotelMenu(null);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-3 rounded-xl text-white font-medium transition mt-5 ${
              isPublishing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPublishing ? "Publishing..." : "Publish Package"}
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showHotelModal && (
        <HotelModal
          initialData={editingHotelData}
          onClose={() => {
            setShowHotelModal(false);
            setEditingHotelIndex(null);
            setEditingHotelData(null);
          }}
          onSave={(hotelData) => {
            setForm((prev) => {
              const updatedHotels = [...prev.hotels];

              if (editingHotelIndex !== null) {
                // ✅ EDIT MODE
                updatedHotels[editingHotelIndex] = hotelData;
              } else {
                // ✅ ADD MODE
                updatedHotels.push(hotelData);
              }

              return {
                ...prev,
                hotels: updatedHotels,
              };
            });

            setShowHotelModal(false);
            setEditingHotelIndex(null);
            setEditingHotelData(null);
          }}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          initialData={editingActivityData}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivityIndex(null);
            setEditingActivityData(null);
          }}
          onSave={(activityData) => {
            setForm((prev) => {
              const updatedActivities = [...prev.activities];

              if (editingActivityIndex !== null) {
                // ✅ EDIT
                updatedActivities[editingActivityIndex] = activityData;
              } else {
                // ✅ ADD
                updatedActivities.push(activityData);
              }

              const updatedItinerary = [...prev.itinerary];

              if (selectedDayIndex !== null) {
                updatedItinerary[selectedDayIndex].activities =
                  updatedItinerary[selectedDayIndex].activities || [];
                updatedItinerary[selectedDayIndex].activities.push(
                  activityData,
                );
              }

              return {
                ...prev,
                activities: updatedActivities,
                itinerary: updatedItinerary,
              };
            });

            setShowActivityModal(false);
            setEditingActivityIndex(null);
            setEditingActivityData(null);
            setSelectedDayIndex(null);
          }}
        />
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-6 text-center shadow-xl">
            {/* ICON */}
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              ✓
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-semibold mb-2">
              Package Published Successfully!
            </h2>

            {/* TEXT */}
            <p className="text-sm text-gray-500 mb-5">
              Your new travel package{" "}
              <span className="font-medium">"{createdPackage?.name}"</span> is
              now live and available for booking.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/packages")}
                className="bg-blue-600 text-white py-2 rounded-lg"
              >
                View Live Package
              </button>

              <button
                onClick={() =>
                  navigate("/packages", { state: { refresh: true } })
                }
                className="border py-2 rounded-lg"
              >
                Back to Packages
              </button>
            </div>

            {/* EXTRA */}
            <div className="mt-5 text-sm text-gray-500">
              <p className="mb-2 font-medium">WHAT'S NEXT?</p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);

                  // reset form cleanly
                  setForm({
                    name: "",
                    location: "",
                    country: "",
                    days: "",
                    nights: "",
                    description: "",
                    price: "",
                    discount: "",
                    status: true,
                    images: [],
                    itinerary: [],
                    hotels: [],
                    activities: [],
                    flightIncluded: true,
                    airportTransfer: "Included",
                  });

                  setImagePreview([]);
                }}
                className="text-blue-600"
              >
                + Create Another Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePackage;
