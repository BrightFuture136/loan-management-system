import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function LoanList() {
  const { hasRole } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get("/api/loan-applications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLoans(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch loans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const handleStatusChange = async (loanId, status) => {
    try {
      await axios.put(
        `/api/loans/${loanId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLoans(
        loans.map((loan) => (loan.id === loanId ? { ...loan, status } : loan))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update loan status");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Loans</h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {loans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No loans found
          </h3>
          {hasRole(["BORROWER", "ADMIN", "MANAGER"]) && (
            <Link
              to="/apply"
              className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply for a Loan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ETB {loan.principal?.toLocaleString() || "N/A"}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    loan.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : loan.status === "CLOSED"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}
                >
                  {loan.status || "Unknown"}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Interest: {loan.interest}% | Schedule:{" "}
                {loan.payment_schedule_days} days
              </p>
              <Link
                to={`/loans/${loan.id}/payments`}
                className="text-blue-500 hover:underline text-sm"
              >
                View Payments
              </Link>
              {hasRole(["ADMIN", "MANAGER"]) && (
                <div className="mt-4">
                  <select
                    value={loan.status}
                    onChange={(e) =>
                      handleStatusChange(loan.id, e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoanList;
