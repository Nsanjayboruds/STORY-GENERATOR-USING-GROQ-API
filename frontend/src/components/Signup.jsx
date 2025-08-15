import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://story-generator-using-groq-api.onrender.com/signup", {
        email: formData.email,
        password: formData.password
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";

      if (err.response) {
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          errorMessage;
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-tr from-indigo-200 via-purple-100 to-pink-200 px-4">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40">
        <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-6">
          🌟 Create Your STORY-GENERATER Account
        </h2>

        {success ? (
          <div className="p-4 text-green-800 bg-green-100 rounded-lg text-center">
            ✅ Account created successfully! Redirecting to login...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="••••••••"
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-sm tracking-wide shadow-md transition-all ${
                  loading
                    ? "bg-purple-300 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-medium hover:underline"
              >
                Log In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
