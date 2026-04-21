import { useState, useEffect } from "react";

const HotelModal = ({ onClose, onSave, initialData }) => {
  const [hotel, setHotel] = useState({
    name: "",
    starRating: "",
    description: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    price: "",
    roomType: "Standard",
    amenities: [],
    images: [],
  });

  // Prefill data (Edit mode)
  useEffect(() => {
    if (initialData) {
      setHotel(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setHotel((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setHotel((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setHotel((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  // ✅ DELETE IMAGE FUNCTION
  const removeImage = (indexToRemove) => {
    setHotel((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const roomTypes = ["Standard", "Deluxe", "Suite"];
  const amenitiesList = ["WiFi", "Pool", "Gym", "Dining", "Spa", "Parking", "AC"];

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-xl p-6">
        
        {/* HEADER */}
        <h2 className="text-xl font-semibold mb-1">
          {initialData ? "Edit Hotel" : "Add New Hotel"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the details of the new property to add it to the platform.
        </p>

        {/* BASIC INFO */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Basic Information</h3>

          <input
            value={hotel.name}
            placeholder="Hotel Name"
            className="w-full border p-2 rounded mb-3"
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <select
            value={hotel.starRating}
            className="w-full border p-2 rounded mb-3"
            onChange={(e) => handleChange("starRating", e.target.value)}
          >
            <option value="">Select rating</option>
            <option value="3">3 Star</option>
            <option value="4">4 Star</option>
            <option value="5">5 Star</option>
          </select>

          <textarea
            value={hotel.description}
            placeholder="Hotel Description"
            className="w-full border p-2 rounded"
            rows={3}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </section>

        {/* LOCATION */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Location</h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Country"
              className="border p-2 rounded"
              value={hotel.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
            <input
              placeholder="City"
              className="border p-2 rounded"
              value={hotel.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <input
            placeholder="Address"
            className="w-full border p-2 rounded mb-3"
            value={hotel.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </section>

        {/* PRICING */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Pricing & Rooms</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            
            {/* PRICE INPUT */}
            <input
              type="text"
              placeholder="Price per night ($)"
              className="border p-2 rounded"
              value={hotel.price}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleChange("price", value);
                }
              }}
            />

            {/* ROOM TYPE */}
            <div className="flex gap-2">
              {roomTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("roomType", type)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    hotel.roomType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AMENITIES */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Amenities</h3>

          <div className="grid grid-cols-3 gap-3">
            {amenitiesList.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hotel.amenities.includes(item)}
                  onChange={() => toggleAmenity(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </section>

        {/* MEDIA */}
        <section className="mb-6">
          <h3 className="font-medium mb-3">Media</h3>

          <label className="border-2 border-dashed rounded-lg p-6 text-center block cursor-pointer">
            <p className="text-sm text-gray-500 mb-2">Upload Images</p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 10MB)</p>

            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* ✅ IMAGE PREVIEW WITH DELETE */}
          <div className="flex gap-3 mt-3">
            {hotel.images.map((file, index) => (
              <div
                key={index}
                className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={() => {
              if (!hotel.name) return alert("Hotel name is required");
              if (!hotel.price) return alert("Price is required");
              if (isNaN(hotel.price)) return alert("Price must be a number");
              if (Number(hotel.price) <= 0)
                return alert("Price must be greater than 0");

              onSave({
                ...hotel,
                price: Number(hotel.price),
              });
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            {initialData ? "Update Hotel" : "Save Hotel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelModal;