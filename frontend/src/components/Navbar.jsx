import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/loan-applications"
          className="text-2xl font-bold tracking-tight"
        >
          DEBO Microfinance
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/loan-applications"
            className="text-sm font-medium hover:text-emerald-100 transition-colors"
          >
            Applications
          </Link>
          <Link
            to="/apply"
            className="text-sm font-medium hover:text-emerald-100 transition-colors"
          >
            Apply for Loan
          </Link>
          <button
            onClick={handleLogout}
            className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-emerald-700 px-4 py-2">
          <Link
            to="/loan-applications"
            className="block py-2 text-sm font-medium hover:text-emerald-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Applications
          </Link>
          <Link
            to="/apply"
            className="block py-2 text-sm font-medium hover:text-emerald-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Apply for Loan
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 text-sm font-medium text-rose-100 hover:text-rose-200 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
