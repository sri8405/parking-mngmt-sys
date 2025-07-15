import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmployeeAuth from "./pages/EmployeeAuth";
import AdminAuth from "./pages/AdminAuth";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import QRGenerator from "./pages/QRGenerator";
import LiveStatus from "./pages/LiveStatus";
import QueueStatus from "./pages/QueueStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employee-auth" element={<EmployeeAuth />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/qr-generator" element={<QRGenerator />} />
          <Route path="/live-status" element={<LiveStatus />} />
          <Route path="/queue-status" element={<QueueStatus />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
