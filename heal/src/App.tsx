import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { PrescriptionProvider } from "./contexts/PrescriptionContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import EarthLoader from "./components/ui/EarthLoader";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import PrescriptionAnalysis from "./pages/PrescriptionAnalysis";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading delay
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // 1.5 seconds loading screen

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <PrescriptionProvider>
                <HelmetProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Helmet 
                      titleTemplate="%s | Healiofy" 
                      defaultTitle="Healiofy - Healthcare at Your Fingertips" 
                    />
                    
                    <AnimatePresence>
                      {isInitialLoading ? (
                        <EarthLoader fullScreen />
                      ) : (
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/doctors" element={<Doctors />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/prescription-analysis" element={
                            <PrivateRoute>
                              <PrescriptionAnalysis />
                            </PrivateRoute>
                          } />
                          <Route path="/appointments" element={
                            <PrivateRoute>
                              <Appointments />
                            </PrivateRoute>
                          } />
                          <Route path="/profile" element={
                            <PrivateRoute>
                              <Profile />
                            </PrivateRoute>
                          } />
                          <Route path="/subscription" element={
                            <PrivateRoute>
                              <Subscription />
                            </PrivateRoute>
                          } />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      )}
                    </AnimatePresence>
                  </TooltipProvider>
                </HelmetProvider>
              </PrescriptionProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
