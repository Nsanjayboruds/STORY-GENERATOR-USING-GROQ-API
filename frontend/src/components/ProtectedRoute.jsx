import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, redirectPath = "/login" }) => {
  const { isLoggedIn, token } = useAuth(); // Optionally use `token` directly
  const location = useLocation();

  // You can add a loading check here if auth validation is async
  // e.g., if loading from Firebase or verifying JWT
  // if (loading) return <div className="text-center mt-10">Checking authentication...</div>;

  if (!isLoggedIn || !token) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
