import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  amount: Yup.number()
    .required("Amount is required")
    .positive("Must be positive")
    .min(1000, "Minimum 1000 ETB"),
  interestRate: Yup.number()
    .required("Interest rate is required")
    .positive("Must be positive")
    .max(100, "Maximum 100%"),
  requiredCollateral: Yup.string()
    .required("Collateral type is required")
    .oneOf([
      "LAND_TITLE_CERTIFICATE",
      "CAR_OWNERSHIP_DOCUMENT",
      "INCOME_PROOF",
    ]),
  dueDateDays: Yup.number()
    .required("Due date is required")
    .positive("Must be positive")
    .integer("Must be a whole number")
    .min(30, "Minimum 30 days"),
});

function LoanProductForm({ onSuccess }) {
  const [serverError, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initialValues = {
    amount: "",
    interestRate: "",
    requiredCollateral: "",
    dueDateDays: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError("");
    setSuccess("");
    try {
      await axios.post("/api/loan-products", values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess("Loan product created");
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create loan product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">
        Add Loan Product
      </h4>
      {serverError && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4 rounded">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (ETB)
              </label>
              <Field
                type="number"
                name="amount"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="amount"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interest Rate (%)
              </label>
              <Field
                type="number"
                name="interestRate"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="interestRate"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Collateral
              </label>
              <Field
                as="select"
                name="requiredCollateral"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select collateral</option>
                <option value="LAND_TITLE_CERTIFICATE">
                  Land Title Certificate
                </option>
                <option value="CAR_OWNERSHIP_DOCUMENT">
                  Car Ownership Document
                </option>
                <option value="INCOME_PROOF">Income Proof</option>
              </Field>
              <ErrorMessage
                name="requiredCollateral"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date (Days)
              </label>
              <Field
                type="number"
                name="dueDateDays"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="dueDateDays"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Loan Product"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoanProductForm;
