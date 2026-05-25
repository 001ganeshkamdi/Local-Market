import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NavBar } from "@/components/layout/NavBar";
import { BuyerLoginPage } from "@/pages/BuyerLoginPage";
import { HomePage } from "@/pages/HomePage";
import { PortalHomePage } from "@/pages/PortalHomePage";
import { ShopDetailPage } from "@/pages/ShopDetailPage";
import { ShopkeeperLoginPage } from "@/pages/ShopkeeperLoginPage";
import { VendorDashboardPage } from "@/pages/VendorDashboardPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PortalHomePage />} />
          <Route path="/buyer/login" element={<BuyerLoginPage />} />
          <Route path="/shopkeeper/login" element={<ShopkeeperLoginPage />} />
          <Route
            path="/buyer"
            element={(
              <ProtectedRoute allowedRole="buyer">
                <ErrorBoundary title="Buyer marketplace could not be loaded.">
                  <HomePage />
                </ErrorBoundary>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/buyer/shop/:id"
            element={(
              <ProtectedRoute allowedRole="buyer">
                <ErrorBoundary title="Shop page could not be loaded.">
                  <ShopDetailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/shopkeeper/dashboard"
            element={(
              <ProtectedRoute allowedRole="shopkeeper">
                <VendorDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/shopkeeper/dashboard" replace />}
          />
          <Route
            path="/shop/:id"
            element={(
              <ProtectedRoute allowedRole="buyer">
                <ErrorBoundary title="Shop page could not be loaded.">
                  <ShopDetailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
