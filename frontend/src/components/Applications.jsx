import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

function Applications() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //   const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get("api/loan-applications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setApplications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/loan-applications/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setApplications(
        applications.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {user.role === "BORROWER"
            ? "My Loan Applications"
            : "Loan Applications"}
        </h2>
        {applications.length === 0 ? (
          <p className="text-gray-600">No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  {user.role !== "BORROWER" && (
                    <th className="py-3 px-6 text-left">Applicant ID</th>
                  )}
                  <th className="py-3 px-6 text-left">Loan Purpose</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Applied Date</th>
                  {user.role === "MANAGER" && (
                    <th className="py-3 px-6 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 text-left">{app.id}</td>
                    {user.role !== "BORROWER" && (
                      <td className="py-3 px-6 text-left">
                        {app.user_id || "N/A"}
                      </td>
                    )}
                    <td className="py-3 px-6 text-left">
                      {app.loan_purpose || "N/A"}
                    </td>
                    <td className="py-3 px-6 text-right">
                      ${app.loan_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.loan_application_status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    {user.role === "MANAGER" && (
                      <td className="py-3 px-6 text-center">
                        {app.loan_application_status === "PENDING" && (
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(app.id, "APPROVED")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app.id, "REJECTED")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
