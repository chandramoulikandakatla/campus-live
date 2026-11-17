import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wallet from "./pages/Wallet";
import ParentDashboard from "./pages/ParentDashboard";
import OperationsDashboard from "./pages/OperationsDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import CollegeDashboard from "./pages/CollegeDashboard";
import OrderTracking from "./pages/OrderTracking";
import StudentProfilePage from "./pages/StudentProfilePage";
import KioskDemo from "./pages/KioskDemo";
import DemoHub from "./pages/DemoHub";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/kiosk/RequireAuth";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import EcosystemApp from "./components/EcosystemApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Public Entry Points */}
              <Route path="/" element={<Welcome />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Student / Kiosk Routes (Unified KioskShell) */}
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/shop" element={<RequireAuth><Shop /></RequireAuth>} />
              <Route path="/products" element={<Navigate to="/shop" replace />} />
              <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
              <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
              <Route path="/profile" element={<StudentProfilePage />} />
              <Route path="/track" element={<OrderTracking />} />
              <Route path="/track/:orderId" element={<OrderTracking />} />

              {/* Role & Management Portals */}
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/operations" element={<OperationsDashboard />} />
              <Route path="/rider" element={<RiderDashboard />} />
              <Route path="/college" element={<CollegeDashboard />} />
              <Route path="/kiosk" element={<KioskDemo />} />
              <Route path="/demo" element={<DemoHub />} />

              {/* Dedicated Multi-Portal Ecosystem Simulation */}
              <Route path="/ecosystem" element={<EcosystemApp />} />
              <Route path="/ecosystem/student" element={<EcosystemApp initialPortal="student" />} />
              <Route path="/ecosystem/parent" element={<EcosystemApp initialPortal="parent" />} />
              <Route path="/ecosystem/ops" element={<EcosystemApp initialPortal="ops" />} />
              <Route path="/ecosystem/college" element={<EcosystemApp initialPortal="college" />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
