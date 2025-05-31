import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/auth/verify-token",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Token validation failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [navigate]);

  const login = (responseData) => {
    console.log(
      "[1] Raw login response:",
      JSON.stringify(responseData, null, 2)
    );

    // Validate response structure
    if (!responseData?.user?.role) {
      console.error("[2] Invalid response - missing role:", responseData);
      return;
    }

    // Force role to uppercase and trim
    const role = responseData.user.role.toString().toUpperCase().trim();
    console.log("[3] Normalized role:", role);

    // Create user data object
    const userData = {
      ...responseData.user,
      role: role,
      token: responseData.token,
    };

    // Store user data
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);

    // Debug: Verify localStorage
    console.log("[4] Stored user:", localStorage.getItem("user"));
    console.log("[5] Stored token:", localStorage.getItem("token"));

    // Dashboard mapping with exact Prisma enum values
    const DASHBOARD_MAP = {
      ADMIN: "/admin-dashboard",
      BORROWER: "/borrower-dashboard",
      MANAGER: "/manager-dashboard",
      CASHER: "/casher-dashboard",
    };

    const targetRoute = DASHBOARD_MAP[role];
    console.log("[6] Determined route:", targetRoute);

    if (!targetRoute) {
      console.error("[7] No route mapped for role:", role);
      return navigate("/login");
    }

    console.log("[8] Attempting navigation to:", targetRoute);
    navigate(targetRoute, { replace: true }); // Force navigation
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const hasRole = (roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
