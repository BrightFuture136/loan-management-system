import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  loan_amount: Yup.number()
    .required("Loan amount is required")
    .positive("Amount must be positive")
    .min(1000, "Minimum loan amount is ETB 1,000"),
  loan_purpose: Yup.string()
    .required("Loan purpose is required")
    .min(10, "Purpose must be at least 10 characters"),
  repayment_period_days: Yup.number()
    .required("Repayment period is required")
    .positive("Period must be positive")
    .integer("Period must be a whole number")
    .min(30, "Minimum repayment period is 30 days"),
  phone_number: Yup.string()
    .required("Phone number is required")
    .matches(/^\+?\d{10,12}$/, "Invalid phone number"),
  region: Yup.string().required("Region is required"),
  zone: Yup.string().required("Zone is required"),
  woreda: Yup.string().required("Woreda is required"),
  citizenship: Yup.string().required("Citizenship is required"),
});

function LoanApplicationForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const initialValues = {
    loan_amount: "",
    loan_purpose: "",
    repayment_period_days: "",
    phone_number: "",
    region: "",
    zone: "",
    woreda: "",
    citizenship: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setServerError("");
    try {
      await axios.post("/api/loan-applications", values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      resetForm();
      navigate("/loan-applications");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Apply for a Loan
      </h2>
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
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Loan Details
              </h3>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Loan Amount (ETB)
              </label>
              <Field
                type="number"
                name="loan_amount"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10000"
              />
              <ErrorMessage
                name="loan_amount"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Loan Purpose
              </label>
              <Field
                as="textarea"
                name="loan_purpose"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe the purpose of the loan"
              />
              <ErrorMessage
                name="loan_purpose"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Repayment Period (Days)
              </label>
              <Field
                type="number"
                name="repayment_period_days"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 180"
              />
              <ErrorMessage
                name="repayment_period_days"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="border-b border-gray-200 pb-4 mb-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Personal Information
              </h3>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone Number
              </label>
              <Field
                type="text"
                name="phone_number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +251912345678"
              />
              <ErrorMessage
                name="phone_number"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Region
              </label>
              <Field
                type="text"
                name="region"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Addis Ababa"
              />
              <ErrorMessage
                name="region"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Zone
              </label>
              <Field
                type="text"
                name="zone"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Kirkos"
              />
              <ErrorMessage
                name="zone"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Woreda
              </label>
              <Field
                type="text"
                name="woreda"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Woreda 01"
              />
              <ErrorMessage
                name="woreda"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Citizenship
              </label>
              <Field
                type="text"
                name="citizenship"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ethiopian"
              />
              <ErrorMessage
                name="citizenship"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoanApplicationForm;
