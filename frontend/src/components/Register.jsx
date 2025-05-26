import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "Unknown",
    date_of_birth: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors `}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors `}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors `}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors `}
              required
            >
              <option value="Unknown">Unknown</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors `}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
