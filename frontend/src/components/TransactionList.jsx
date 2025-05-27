import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function TransactionList() {
  useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("/api/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTransactions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

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
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Transactions</h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No transactions found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                ETB {transaction.amount?.toLocaleString() || "N/A"}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Type: {transaction.reference_type || "N/A"} | Date:{" "}
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
