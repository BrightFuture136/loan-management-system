import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import LoanProductForm from "./LoanProductForm";

function ManagerDashboard() {
  const { hasRole } = useContext(AuthContext);
  const [loanApplications, setLoanApplications] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole(["MANAGER"])) {
      setError("Unauthorized Access");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [applicationsResponse, productsResponse, notificationsResponse] =
          await Promise.all([
            axios.get("/api/loan-applications", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            axios.get("/api/loan-products", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            axios.get("/api/notifications", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
          ]);
        setLoanApplications(applicationsResponse.data);
        setLoanProducts(productsResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [hasRole]);

  const fetchPaymentHistory = async (userId) => {
    try {
      const response = await axios.get(
        `/api/payments/history?user_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPaymentHistory((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch {
      setError("Failed to fetch payment history");
    }
  };

  const handleTransfer = async (loanApplicationId) => {
    try {
      await axios.post(
        "/api/loan-applications/transfer",
        { loan_application_id: loanApplicationId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Loan Request transferred to casher");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transfer request");
    }
  };

  const handleApproveOrReject = async (loanApplicationId, status) => {
    try {
      await axios.post(
        "/api/loans/approve-or-reject",
        { loan_application_id: loanApplicationId, status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLoanApplications((prev) =>
        prev.map((app) =>
          prev.app.id === loanApplicationId
            ? { ...app, loan_application_status: status }
            : app
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update loan application"
      );
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
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Manager Dashboard
      </h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Loan Products
        </h3>
        <LoanProductForm
          onSuccess={() => {
            axios
              .get("/api/loan-products", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
              .then((response) => setLoanProducts(response.data));
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loanProducts.map((product) => (
            <div key={product.id} class="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-800">
                ETB {product.amount.toLocaleString()}
              </h4>
              <p class="text-sm text-gray-600">
                Interest: {product.interestRate}%
              </p>
              <p class="text-sm text-gray-600">
                Collateral: {product.requiredCollateral}
              </p>
              <p class="text-sm text-gray-600">
                Due in: {product.dueDateDays} days
              </p>
            </div>
          ))}
        </div>
      </section>
      <section class="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Loan Requests
        </h3>
        {loanApplications.length === 0 ? (
          <div class="bg-white rounded-xl p-6 text-center text-gray-500">
            No loan requests
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loanApplications.map((app) => (
              <div key={app.id} class="bg-white rounded-xl p-6">
                <h4 class="text-lg font-semibold text-gray-700">
                  Loan #{app.id}
                </h4>
                <p class="text-sm text-gray-600">Borrower ID: #{app.user_id}</p>
                <p class="text-sm text-gray-600">
                  Amount: : ETB {app.loan_amount.toLocaleString(2)}
                </p>
                <p class="text-sm text-gray-600">
                  Status: : {app.loan_application_status}
                </p>
                <button
                  onClick={() => fetchPaymentHistory(app.user_id)}
                  class="mt-2 text-blue-500 hover:underline text-sm"
                >
                  View Payment History
                </button>
                {paymentHistory[app.user_id] && (
                  <div class="mt-2">
                    <p class="text-sm text-gray-600">
                      Payments: : {paymentHistory[app.user_id].length}
                      {paymentHistory[app.user_id].map((p) => (
                        <p key={p.id} class="text-sm text-gray-600">
                          ETB {p.amount.toLocaleString()} - - {p.status}
                        </p>
                      ))}
                    </p>
                  </div>
                )}
                <div class="mt-4 space-x-2">
                  <button
                    onClick={() => handleTransfer(app.id)()}
                    disabled={app.loan_application_status !== "PENDING"}
                    class="bg-yellow-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Transfer to Casher
                  </button>
                  <button
                    onClick={() => handleApproveOrReject(app.id, "APPROVED")()}
                    disabled={app.loan_application_status !== "PENDING"}
                    class="bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveOrReject(app.id, "REJECTED")()}
                    disabled={app.loan_application_status !== "PENDING"}
                    class="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section class="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Notifications
        </h3>
        {notifications.length === 0 ? (
          <div class="bg-white rounded-xl p-6 text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notifications.map((notif) => (
              <div key={notif.id} class="bg-white rounded-xl p-4">
                <h4 class="text-sm font-semibold text-gray-700">
                  {notif.title}
                </h4>
                <p class="text-sm text-gray-600">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ManagerDashboard;
