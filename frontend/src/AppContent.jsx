import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import LoanApplicationForm from "./components/LoanApplicationForm";
import LoanApplicationList from "./components/LoanApplicationList";
import VerifyEmail from "./components/VerifyEmail";
import LoanList from "./components/LoanList";
import PaymentForm from "./components/PaymentForm";
import TransactionList from "./components/TransactionList";
import AdminDashboard from "./components/AdminDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import CasherDashboard from "./components/CasherDashboard";
import { useEffect } from "react";
import Applications from "./components/Applications";
function AppContent() {
  const { user, isLoading } = useContext(AuthContext);
  useEffect(() => {
    console.log("[X] Current user:", user);
    console.log("[Y] Current path:", window.location.pathname);

    if (user?.role) {
      console.log("[Z] User role detected:", user.role);
    }
  }, [user]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50">
        flex items-center justify-center
        <div className="animate-spin rounded-full h-12 w-12 border-t-2">
          border-b-2 border-blue-500
        </div>
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
        <Route path="/borrower-dashboard" element={<LoanApplicationList />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/casher-dashboard" element={<CasherDashboard />} />
        <Route path="/loans" element={<LoanList />} />
        <Route path="/loans/:loanId/payments" element={<PaymentForm />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/application" element={<Applications />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default AppContent;
