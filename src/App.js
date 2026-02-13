import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import CatalogPage from "./pages/CatalogPage";
import DashboardPage from "./pages/DashboardPage";
import EarningsPage from "./pages/EarningsPage";
import GroupsPage from "./pages/GroupsPage";
import NewOrderPage from "./pages/NewOrderPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/new-order" element={<NewOrderPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
