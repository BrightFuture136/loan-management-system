import { useState, useContext } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";

const validationSchema = Yup.object({
  userId: Yup.number()
    .required("User ID is required")
    .positive("Invalid ID")
    .integer("Invalid ID"),
  role: Yup.string()
    .required("Role is required")
    .oneOf(["MANAGER", "CASHER", "BORROWER"], "Invalid role"),
});

function AdminDashboard() {
  const { hasRole } = useContext(AuthContext);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const initialValues = {
    userId: "",
    role: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setServerError("");
    setSuccess("");
    try {
      const response = await axios.post(
        "/api/admin/change-role",
        { user_id: values.userId, role: values.role },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess(response.data.message);
      resetForm();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to change role");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasRole(["ADMIN"])) {
    return (
      <div className="container mx-auto p-6 text-center">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      {serverError && (
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l border-green-4 border-green-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white p-8 rounded-xl shadow-sm space-y-6">
            <div>
              <label className="block text-gray-700">User ID</label>
              <Field
                type="number"
                name="userId"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
              <ErrorMessage
                name="userId"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-1">Role</label>
              <Field
                as="select"
                name="role"
                class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select role</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHER">Cashier</option>
                <option value="BORROWER">Borrower</option>
              </Field>
              <ErrorMessage
                name="role"
                component="p"
                class="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full bg-blue-500 text-white-3 p-0 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Changing Role..." : "Change Role"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AdminDashboard;
