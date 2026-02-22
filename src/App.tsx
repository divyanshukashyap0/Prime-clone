import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";

// Lazy-loaded pages for better performance
const Index = lazy(() => import("./pages/Index"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
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

const App = () => (
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
              <Route path="/subscriptions" element={<CategoryPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/watch-anywhere" element={<WatchAnywherePage />} />
              <Route path="/profiles/new" element={<ProtectedRoute><AddProfilePage /></ProtectedRoute>} />
              <Route path="/profiles/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
              <Route path="/profiles/learn-more" element={<ProfileLearnMorePage />} />
              <Route path="/profile" element={<AccountPage />} />
              <Route path="/mystuff" element={<CategoryPage />} />
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

export default App;
