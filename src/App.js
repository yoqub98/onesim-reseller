import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CatalogPage from "./pages/CatalogPage";
import DashboardPage from "./pages/DashboardPage";
import EarningsPage from "./pages/EarningsPage";
import GroupsPage from "./pages/GroupsPage";
import LoginPage from "./pages/LoginPage";
import NewOrderPage from "./pages/NewOrderPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import PendingAccountPage from "./pages/PendingAccountPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";

/**
 * ProtectedRoute - Redirects based on auth & partner status
 *
 * States:
 * 1. Not authenticated -> /login
 * 2. Authenticated but no partner record or pending_approval -> /pending-account
 * 3. Authenticated + active partner -> full access
 */
function ProtectedRoute({ children, pendingOnly = false }) {
  const { isAuthenticated, isLoading, isPendingApproval, hasPartnerRecord } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated but partner is not yet approved
  const needsApproval = !hasPartnerRecord || isPendingApproval;

  if (pendingOnly && !needsApproval) {
    // Already approved, redirect away from pending page
    return <Navigate to="/" replace />;
  }

  if (!pendingOnly && needsApproval) {
    // Not approved yet, redirect to pending page
    return <Navigate to="/pending-account" replace />;
  }

  return <AppShell disableNavigation={pendingOnly}>{children}</AppShell>;
}

/**
 * PublicRoute - Redirects to dashboard if user is already authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, isPendingApproval, hasPartnerRecord } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const needsApproval = !hasPartnerRecord || isPendingApproval;
    return <Navigate to={needsApproval ? "/pending-account" : "/"} replace />;
  }

  return children;
}

function FallbackRoute() {
  const { isAuthenticated, isLoading, isPendingApproval, hasPartnerRecord } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const needsApproval = !hasPartnerRecord || isPendingApproval;
  return <Navigate to={needsApproval ? "/pending-account" : "/"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Login & Signup */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Main Application */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-order"
        element={
          <ProtectedRoute>
            <NewOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/earnings"
        element={
          <ProtectedRoute>
            <EarningsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending-account"
        element={
          <ProtectedRoute pendingOnly>
            <PendingAccountPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
