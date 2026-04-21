import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  // 🔥 IMPORTANT: wait for Zustand to load
  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  if (!hasHydrated) {
    return null; // or loader
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;