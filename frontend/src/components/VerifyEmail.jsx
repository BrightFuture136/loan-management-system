import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const verificationSchema = yup.object().shape({
  code: yup
    .string()
    .required("Verification code is required")
    .matches(/^\d{6}$/, "Code must be a 6-digit number")
    .typeError("Code must be a number"),
});

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleVerify = async (values, { resetForm }) => {
    setLoading(true);
    setServerError(null);

    try {
      const email = location.state?.email;
      if (!email) {
        throw new Error("Email is required for verification");
      }

      const res = await axios.post("/api/auth/verify-email", {
        email,
        code: values.code,
      });

      if (res.data.success) {
        const { access_token, user } = res.data.data;
        login({
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          token: access_token,
        });
        localStorage.setItem("access_token", access_token);
        alert("Email verified successfully!");
        navigate("/loan-applications", { replace: true });
        resetForm();
      } else {
        setServerError(res.data.message || "Verification failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Server error";
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Verify Email
        </h2>
        <p className="text-center text-blue-600 mb-6">
          Enter the 6-digit verification code sent to{" "}
          {location.state?.email || "your email"}
        </p>
        {serverError && (
          <p className="text-red-500 mb-4 text-center">{serverError}</p>
        )}
        <Formik
          initialValues={{ code: "" }}
          validationSchema={verificationSchema}
          onSubmit={handleVerify}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            isValid,
          }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={values.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border ${
                    touched.code && errors.code
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
                {touched.code && errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !isValid}
                className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  loading || !isValid ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Verify"}
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default VerifyEmail;
