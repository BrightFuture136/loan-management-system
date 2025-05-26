import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";

const validationSchema = Yup.object({
  amount: Yup.number()
    .required("Payment amount is required")
    .positive("Amount must be positive")
    .min(100, "Minimum payment amount is ETB 100"),
});

function PaymentForm() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useContext(AuthContext);
  const [serverError, setServerError] = useState("");

  const initialValues = {
    amount: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setServerError("");
    try {
      await axios.post(
        "/api/payments",
        {
          loan_id: loanId,
          amount: values.amount,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      resetForm();
      navigate("/loans");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Submit Payment</h2>
      {serverError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{serverError}</p>
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
              <label className="block text-gray-700 font-medium mb-1">
                Payment Amount (ETB)
              </label>
              <Field
                type="number"
                name="amount"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5000"
              />
              <ErrorMessage
                name="amount"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !hasRole(["CASHER", "BORROWER", "ADMIN", "MANAGER"])
              }
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default PaymentForm;
