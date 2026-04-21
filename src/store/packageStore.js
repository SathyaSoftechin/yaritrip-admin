import { createContext, useContext, useState } from "react";

const PackagesContext = createContext();

const initialData = [
  {
    id: "PKG-2045",
    name: "Tropical Paradise Getaway",
    location: "Bali, Indonesia",
    duration: "7 Days, 6 Nights",
    price: "$1,299",
    bookings: 458,
    status: "Active",
    updated: "Oct 24, 2023",
  },
  {
    id: "PKG-2047",
    name: "Alpine Winter Special",
    location: "Zermatt, Switzerland",
    duration: "5 Days, 4 Nights",
    price: "$1,800",
    bookings: 82,
    status: "Active",
    updated: "Sep 15, 2023",
  },
];

export const PackagesProvider = ({ children }) => {
  const [packages, setPackages] = useState(initialData);

  const updatePackage = (id, updatedData) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updatedData } : pkg
      )
    );
  };

  return (
    <PackagesContext.Provider value={{ packages, updatePackage }}>
      {children}
    </PackagesContext.Provider>
  );
};

export const usePackages = () => useContext(PackagesContext);