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
    if (!responseData?.user?.role) {
      console.error("Role is missing in response:", responseData);
      return;
    }

    // Normalize the role to uppercase to match Prisma enum
    const normalizedRole = responseData.user.role.toUpperCase();
    const userData = {
      ...responseData.user,
      role: normalizedRole,
      token: responseData.token,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);

    console.log("User role after normalization:", normalizedRole); // Debug log

    const dashboardMap = {
      ADMIN: "/admin-dashboard",
      BORROWER: "/borrower-dashboard",
      MANAGER: "/manager-dashboard",
      CASHER: "/casher-dashboard", // Note: Must match exactly with your Prisma enum
    };

    const dashboard = dashboardMap[normalizedRole];
    if (!dashboard) {
      console.error("No dashboard mapped for role:", normalizedRole);
      return navigate("/login");
    }

    console.log("Navigating to:", dashboard); // Debug log
    navigate(dashboard);
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
