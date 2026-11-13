import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DemoHub from "./pages/DemoHub";
import CollegeDashboard from "./pages/CollegeDashboard";
import OperationsDashboard from "./pages/OperationsDashboard";
import Wallet from "./pages/Wallet";
import KioskDemo from "./pages/KioskDemo";
import RiderDashboard from "./pages/RiderDashboard";
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
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo" element={<DemoHub />} />
            <Route path="/college" element={<CollegeDashboard />} />
            <Route path="/operations" element={<OperationsDashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/kiosk" element={<KioskDemo />} />
            <Route path="/rider" element={<RiderDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
