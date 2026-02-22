import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";

// Lazy-loaded pages for better performance
const Index = lazy(() => import("./pages/Index"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const MyStuffPage = lazy(() => import("./pages/MyStuffPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const BillingHistoryPage = lazy(() => import("./pages/BillingHistoryPage"));
const SecuritySettingsPage = lazy(() => import("./pages/SecuritySettingsPage"));
const DevicesPage = lazy(() => import("./pages/DevicesPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const WatchAnywherePage = lazy(() => import("./pages/WatchAnywherePage"));
const AddProfilePage = lazy(() => import("./pages/AddProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const ProfileLearnMorePage = lazy(() => import("./pages/ProfileLearnMorePage"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const initTimer = async () => {
      const startTime = Date.now();
      let durationMs = 4000; // Default 4s

      try {
        const settingsDoc = await getDoc(doc(db, "settings", "global"));
        if (settingsDoc.exists() && settingsDoc.data()?.loaderDuration) {
          durationMs = settingsDoc.data().loaderDuration * 1000;
        }
      } catch (e) {
        console.warn("Could not fetch global settings, defaulting to 4s");
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);

      timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, remaining);
    };

    initTimer();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/view/:category" element={<CategoryPage />} />
                {/* Navigation item routes */}
                <Route path="/sacrifice" element={<CategoryPage />} />
                <Route path="/movies" element={<CategoryPage />} />
                <Route path="/tv-shows" element={<CategoryPage />} />
                <Route path="/live-tv" element={<CategoryPage />} />
                <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
                <Route path="/billing-history" element={<ProtectedRoute><BillingHistoryPage /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><SecuritySettingsPage /></ProtectedRoute>} />
                <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/help" element={<SupportPage />} />
                <Route path="/watch-anywhere" element={<WatchAnywherePage />} />
                <Route path="/profiles/new" element={<ProtectedRoute><AddProfilePage /></ProtectedRoute>} />
                <Route path="/profiles/edit/:id" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                <Route path="/profiles/learn-more" element={<ProfileLearnMorePage />} />
                <Route path="/profile" element={<AccountPage />} />
                <Route path="/mystuff" element={<ProtectedRoute><MyStuffPage /></ProtectedRoute>} />
                {/* Legal routes */}
                <Route path="/legal/:category" element={<CategoryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
