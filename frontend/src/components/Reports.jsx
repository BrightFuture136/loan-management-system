import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Reports() {
  const { hasRole } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole(["ADMIN"])) {
      setError("Unauthorized access");
      setIsLoading(false);
      return;
    }
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/reports", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReports(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch reports");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [hasRole]);

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
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Reports</h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No reports found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {report.type}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Created: {new Date(report.created_at).toLocaleDateString()}
              </p>
              <pre className="text-sm text-gray-600">
                {JSON.stringify(report.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;
