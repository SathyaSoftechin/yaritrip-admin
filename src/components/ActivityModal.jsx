import { useState, useEffect } from "react";

const ActivityModal = ({ onClose, onSave, initialData }) => {
  const [activity, setActivity] = useState({
    name: "",
    destination: "",
    category: "",
    duration: "",
    price: "",
    description: "",
    services: [],
    images: [],
  });

  // Prefill in edit mode
  useEffect(() => {
    if (initialData) {
      setActivity(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setActivity((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service) => {
    setActivity((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setActivity((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const servicesList = ["Transportation", "Lunch"];
  const removeImage = (indexToRemove) => {
    setActivity((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-xl p-6">
        {/* HEADER */}
        <h2 className="text-xl font-semibold mb-1">
          {initialData ? "Edit Activity" : "Add New Activity"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details to list a new travel experience.
        </p>

        {/* ---------------- BASIC INFO ---------------- */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Basic Information</h3>

          <input
            value={activity.name}
            placeholder="Activity Name"
            className="w-full border p-2 rounded mb-3"
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Destination"
              className="border p-2 rounded"
              value={activity.destination}
              onChange={(e) => handleChange("destination", e.target.value)}
            />

            <input
              placeholder="Category"
              className="border p-2 rounded"
              value={activity.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </div>

          <input
            placeholder="Duration"
            className="w-full border p-2 rounded"
            value={activity.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </section>

        {/* ---------------- DESCRIPTION & PRICING ---------------- */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Description & Pricing</h3>

          {/* ✅ PRICE INPUT (NUMBERS ONLY) */}
          <input
            type="text"
            placeholder="Price (USD)"
            className="w-full border p-2 rounded mb-3"
            value={activity.price}
            onChange={(e) => {
              const value = e.target.value;

              // Allow only numbers
              if (/^\d*$/.test(value)) {
                handleChange("price", value);
              }
            }}
          />

          <textarea
            value={activity.description}
            placeholder="Provide a detailed itinerary and what makes this activity special..."
            className="w-full border p-2 rounded mb-3"
            rows={3}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          {/* SERVICES */}
          <div>
            <p className="text-sm mb-2">Included Services</p>
            <div className="flex flex-wrap gap-2">
              {servicesList.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    activity.services.includes(service)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {service}
                </button>
              ))}

              <button
                type="button"
                className="px-3 py-1 rounded-full text-sm border bg-gray-50"
              >
                + Add New
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- MEDIA ---------------- */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Media</h3>

          <label className="border-2 border-dashed rounded-lg p-6 text-center block cursor-pointer">
            <p className="text-sm text-gray-500 mb-2">
              Click to upload or drag and drop images
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG or WEBP (up to 10MB each)
            </p>

            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* IMAGE PREVIEW */}
          <div className="flex gap-3 mt-3">
            {activity.images.map((file, index) => (
              <div
                key={index}
                className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                {/* ❌ DELETE BUTTON */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- ACTIONS ---------------- */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={() => {
              if (!activity.name) return alert("Activity name is required");

              if (!activity.price) {
                return alert("Price is required");
              }

              if (isNaN(activity.price)) {
                return alert("Price must be a number");
              }

              if (Number(activity.price) <= 0) {
                return alert("Price must be greater than 0");
              }

              onSave({
                ...activity,
                price: Number(activity.price),
              });
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            {initialData ? "Update Activity" : "Add Activity"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
