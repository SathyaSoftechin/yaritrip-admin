import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const EditPackage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [form, setForm] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  const normalizeItinerary = (itinerary = []) =>
    itinerary.map((day) => ({
      title: day.title || "",
      description: day.description || day.desc || "",
      activities: day.activities || [],
    }));

  const normalizePackage = (pkg) => ({
    ...pkg,
    name: pkg.name || "",
    location: pkg.location || "",
    price: pkg.price || 0,
    images: Array.isArray(pkg.images) ? pkg.images : [],
    hotels: pkg.hotels || [],
    activities: pkg.activities || [],
    itinerary: normalizeItinerary(pkg.itinerary),
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("packages")) || [];

    const data = location.state?.packageData || stored.find((p) => p.id === id);

    if (data) {
      const normalized = normalizePackage(data);

      setForm({
        ...normalized,
        days: parseInt(normalized.duration?.split(" ")[0]) || 1,
        nights: parseInt(normalized.duration?.split(",")[1]) || 1,
        discount: normalized.discount || 0,
        category: normalized.category || "Luxury",
        status: normalized.status === "Active",
        flightIncluded: normalized.flightIncluded || false,
      });

      setPreviewImages(normalized.images);
    }
  }, [id, location]);

  if (!form) return <p className="p-6">Loading...</p>;

  const handleSave = () => {
    const stored = JSON.parse(localStorage.getItem("packages")) || [];

    const updated = stored.map((p) =>
      p.id === form.id
        ? {
            ...form,
            duration: `${form.days} Days, ${form.nights} Nights`,
            status: form.status ? "Active" : "Draft",
            images: previewImages,
            updated: new Date().toLocaleDateString(),
          }
        : p,
    );

    localStorage.setItem("packages", JSON.stringify(updated));
    navigate("/packages");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const readers = files.map(
      (file) =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((imgs) => {
      const updated = [...previewImages, ...imgs].slice(0, 5);
      setPreviewImages(updated);
      setForm({ ...form, images: updated });
    });
  };

  const removeItem = (type, index) => {
    const updated = form[type].filter((_, i) => i !== index);
    setForm({ ...form, [type]: updated });
  };

  const addItem = (type) => {
    const value = prompt(`Enter ${type}`);
    if (!value) return;
    setForm({ ...form, [type]: [...form[type], value] });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Edit Package: {form.name}</h1>
          <p className="text-sm text-gray-500">
            Modify the details of this travel package.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/packages")}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          {/* BASIC */}
          <Card title="Basic Information">
            <Input
              label="Package Title"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Destination"
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={["Luxury", "Budget", "Standard"]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (Days)"
                value={form.days}
                onChange={(v) => setForm({ ...form, days: v })}
              />
              <Input
                label="Duration (Nights)"
                value={form.nights}
                onChange={(v) => setForm({ ...form, nights: v })}
              />
            </div>
          </Card>

          {/* MEDIA */}
          <Card title="Package Media">
            <div className="flex gap-3 flex-wrap">
              {previewImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-24 h-20 rounded object-cover"
                />
              ))}

              <label className="w-24 h-20 border-dashed border flex items-center justify-center cursor-pointer rounded">
                + Upload
                <input
                  hidden
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </Card>

          {/* ITINERARY */}
          <Card title="Itinerary Builder">
            {form.itinerary?.map((day, i) => (
              <div key={i} className="border p-3 rounded mb-2">
                <p className="font-medium">{day.title}</p>
                <p className="text-sm text-gray-500">{day.description}</p>
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card title="Pricing & Status">
            <Input
              label="Base Price"
              value={form.price}
              onChange={(v) => setForm({ ...form, price: v })}
            />

            <Input
              label="Discount (%)"
              value={form.discount}
              onChange={(v) => setForm({ ...form, discount: v })}
            />

            <Toggle
              label="Active"
              checked={form.status}
              onChange={() => setForm({ ...form, status: !form.status })}
            />
          </Card>

          <Card title="Hotels & Activities">
            <SectionList
              title="Hotels"
              items={form.hotels}
              onAdd={() => addItem("hotels")}
              onRemove={(i) => removeItem("hotels", i)}
            />

            <SectionList
              title="Activities"
              items={form.activities}
              onAdd={() => addItem("activities")}
              onRemove={(i) => removeItem("activities", i)}
            />
          </Card>

          <Card title="Transport">
            <Toggle
              label="Flight Included"
              checked={form.flightIncluded}
              onChange={() =>
                setForm({
                  ...form,
                  flightIncluded: !form.flightIncluded,
                })
              }
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

/* 🔹 UI COMPONENTS */

const Card = ({ title, children }) => (
  <div className="bg-white p-5 rounded-xl shadow">
    <h2 className="font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Input = ({ label, value, onChange }) => (
  <div className="mb-3">
    <p className="text-xs text-gray-500">{label}</p>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border p-2 rounded mt-1"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <p className="text-xs text-gray-500">{label}</p>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border p-2 rounded mt-1"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex justify-between items-center mt-3">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} />
  </div>
);

const SectionList = ({ title, items, onAdd, onRemove }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-2">
      <p className="text-sm font-medium">{title}</p>
      <button onClick={onAdd} className="text-blue-600 text-sm">
        + Add
      </button>
    </div>

    {items?.map((item, i) => (
      <div key={i} className="flex justify-between text-sm mb-1">
        <span>{typeof item === "object" ? item.name : item}</span>
        <button onClick={() => onRemove(i)}>✕</button>
      </div>
    ))}
  </div>
);

export default EditPackage;
