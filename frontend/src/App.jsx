import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Signup from "./components/Signup";
import Login from "./components/Login";
import StoryGenerator from "./components/StoryGenerator";
import Navbar from "./components/Navbar";


const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();
  if (token) {
    const returnTo = location.state?.from?.pathname || "/story";
    return <Navigate to={returnTo} replace />;
  }
  return children;
};

function App() {
  const location = useLocation();

 
  const hideNavbar = location.pathname === "/signup" || location.pathname === "/login";

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
      <div className={`${!hideNavbar ? "pt-24" : ""} px-4 min-h-screen`}>
        <Routes>
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/story"
            element={
              <ProtectedRoute>
                <StoryGenerator />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/404" element={<h2 className="text-center mt-10 text-xl">404 - Page Not Found</h2>} /> */}
          <Route path="*" element={<Navigate to="/story" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
