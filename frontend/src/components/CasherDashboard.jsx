import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const paymentValidationSchema = Yup.object({
  borrowerId: Yup.number()
    .required("Borrower ID is required")
    .positive("Invalid ID")
    .integer("Invalid ID"),
  loanId: Yup.number()
    .required("Loan ID is required")
    .positive("Invalid ID")
    .integer("Invalid ID"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Must be positive")
    .min(100, "Minimum 100 ETB"),
});

const documentValidationSchema = Yup.object({
  documentId: Yup.number()
    .required("Document ID is required")
    .positive()
    .integer(),
  documentType: Yup.string()
    .required("Document type is required")
    .oneOf(["COLLATERAL", "INCOME_PROOF"]),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["VERIFIED", "REJECTED"]),
});

function CasherDashboard() {
  const { hasRole } = useContext(AuthContext);
  const [loanApplications, setLoanApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole(["CASHER"])) {
      setError("Unauthorized Access");
      setIsLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get("/api/loans", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLoanApplications(
          response.data.filter(
            (app) =>
              app.collaterals.some((c) => c.status === "PENDING") ||
              app.borrower_personalInfo?.incomeProofs?.some(
                (p) => p.status === "PENDING"
              )
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [hasRole]);

  const handlePaymentVerification = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("/api/casher/verify-payment", values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess(response.data.message);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentVerification = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post("/api/casher/verify-document", values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess(response.data.message);
      setLoanApplications((prev) =>
        prev.map((app) => ({
          ...app,
          collaterals: app.collaterals.map((c) =>
            c.id === values.documentId && values.documentType === "COLLATERAL"
              ? { ...c, ...c, status: values.status }
              : c
          ),
          borrowerPersonalInfo: {
            ...app.borrowerPersonalInfo,
            incomeProofs: app.borrowerPersonalInfo?.incomeProofs?.map((p) =>
              p.id === values.documentId &&
              values.documentType === "INCOME_PROOF"
                ? { ...p, status: values.status }
                : p
            ),
          },
        }))
      );
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify document");
    } finally {
      setSubmitting(false);
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
        Casher Dashboard
      </h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
      <section className="mb-12">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Verify Payment
        </h3>
        <Formik
          initialValues={{ borrowerId: "", loanId: "", amount: "" }}
          validationSchema={paymentValidationSchema}
          onSubmit={handlePaymentVerification}
        >
          {({ isSubmitting }) => (
            <Form className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Borrower ID
                </label>
                <Field
                  type="number"
                  name="borrowerId"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="borrowerId"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan ID
                </label>
                <Field
                  type="number"
                  name="loanId"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="loanId"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify Payment"}
              </button>
            </Form>
          )}
        </Formik>
      </section>
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Verify Documents
        </h3>
        {loanApplications.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-gray-500">
            No pending documents
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loanApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-700">
                  Loan Application #{app.id}
                </h4>
                <p className="text-sm text-gray-600">
                  Borrower ID: {app.user_id}
                </p>
                {app.collaterals.map((collateral) => (
                  <div key={collateral.id} className="mt-2">
                    <p className="text-sm text-gray-600">
                      Collateral ID: {collateral.id} - {collateral.status}
                    </p>
                    <Formik
                      initialValues={{
                        documentId: collateral.id,
                        documentType: "COLLATERAL",
                        status: "",
                      }}
                      validationSchema={documentValidationSchema}
                      onSubmit={handleDocumentVerification}
                    >
                      {({ isSubmitting }) => (
                        <Form className="mt-2 space-y-2">
                          <Field
                            as="select"
                            name="status"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status</option>
                            <option value="VERIFIED">Approve</option>
                            <option value="REJECTED">Reject</option>
                          </Field>
                          <ErrorMessage
                            name="status"
                            component="p"
                            className="text-red-500 text-sm mt-1"
                          />
                          <button
                            type="submit"
                            disabled={
                              isSubmitting || collateral.status !== "PENDING"
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            {isSubmitting ? "Verifying..." : "Verify"}
                          </button>
                        </Form>
                      )}
                    </Formik>
                  </div>
                ))}
                {app.borrowerPersonalInfo?.incomeProofs?.map((proof) => (
                  <div key={proof.id} className="mt-2">
                    <p className="text-sm text-gray-600">
                      Income Proof ID: {proof.id} - {proof.status}
                    </p>
                    <Formik
                      initialValues={{
                        documentId: proof.id,
                        documentType: "INCOME_PROOF",
                        status: "",
                      }}
                      validationSchema={documentValidationSchema}
                      onSubmit={handleDocumentVerification}
                    >
                      {({ isSubmitting }) => (
                        <Form className="mt-2 space-y-2">
                          <Field
                            as="select"
                            name="status"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status</option>
                            <option value="VERIFIED">Approve</option>
                            <option value="REJECTED">Reject</option>
                          </Field>
                          <ErrorMessage
                            name="status"
                            component="p"
                            className="text-red-500 text-sm mt-1"
                          />
                          <button
                            type="submit"
                            disabled={
                              isSubmitting || proof.status !== "PENDING"
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-500"
                          >
                            {isSubmitting ? "Verifying..." : "Verify"}
                          </button>
                        </Form>
                      )}
                    </Formik>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CasherDashboard;
