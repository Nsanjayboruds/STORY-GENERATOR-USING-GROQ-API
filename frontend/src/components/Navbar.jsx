import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const { logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo / Brand */}
      <Link to="/" className="text-xl font-bold text-blue-500 hover:text-blue-300">
        🧠 STORY-GENERATER
      </Link>

      {/* Navigation / Actions */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link 
              to="/story"
              className="text-white hover:text-blue-400 font-semibold text-sm"
            >
              Generate Story
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login"
              className="text-gray-300 hover:text-blue-400 font-medium text-sm"
            >
              Login
            </Link>
            <Link 
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
