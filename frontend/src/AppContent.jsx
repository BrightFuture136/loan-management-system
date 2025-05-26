// AppContent.jsx
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import LoanApplicationForm from "./components/LoanApplicationForm";
import LoanApplicationList from "./components/LoanApplicationList";
import VerifyEmail from "./components/VerifyEmail";

function AppContent() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/apply" element={<LoanApplicationForm />} />
        <Route path="/loan-applications" element={<LoanApplicationList />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default AppContent;
