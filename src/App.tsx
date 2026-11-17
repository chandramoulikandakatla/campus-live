import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import EcosystemApp from "./components/EcosystemApp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wallet from "./pages/Wallet";
import RiderDashboard from "./pages/RiderDashboard";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/kiosk/RequireAuth";
import { AuthProvider } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* Primary Unified 4-Portal Ecosystem Routes */}
            <Route path="/" element={<EcosystemApp />} />
            <Route path="/welcome" element={<EcosystemApp />} />
            <Route path="/student" element={<EcosystemApp initialPortal="student" />} />
            <Route path="/parent" element={<EcosystemApp initialPortal="parent" />} />
            <Route path="/operations" element={<EcosystemApp initialPortal="ops" />} />
            <Route path="/ops" element={<EcosystemApp initialPortal="ops" />} />
            <Route path="/college" element={<EcosystemApp initialPortal="college" />} />
            <Route path="/demo" element={<EcosystemApp />} />
            <Route path="/kiosk" element={<EcosystemApp />} />

            {/* Legacy Standalone / Kiosk Shell Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/shop" element={<RequireAuth><Shop /></RequireAuth>} />
            <Route path="/products" element={<Navigate to="/shop" replace />} />
            <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
            <Route path="/rider" element={<RiderDashboard />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
