import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Header from "./components/Header";
// import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";

// Loading component for better UX
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="loading-spinner"></div>
  </div>
);

// Lazy load all routes for code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const ApplicationForm = lazy(() => import("./pages/ApplicationForm"));
const SocialNetworks = lazy(() => import("./pages/SocialNetworks"));
const ApplicationStatus = lazy(() => import("./pages/ApplicationStatus"));
const Contributors = lazy(() => import("./pages/Contributors"));
const Courses = lazy(() => import("./pages/Courses"));
const Token = lazy(() => import("./pages/Token"));
const Blog = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Snapshot = lazy(() => import("./pages/Snapshot"));
const UvdWheel = lazy(() => import("./pages/UvdWheelPage"));
const TwitchCallback = lazy(() => import('./pages/TwitchCallback'));
const SafeStats = lazy(() => import("./pages/SafeStats"));
const MetricsDashboard = lazy(() => import("./pages/MetricsDashboard"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const NFTPage = lazy(() => import("./pages/NFTPage"));
const StreamSummaries = lazy(() => import("./pages/StreamSummaries"));
const Events = lazy(() => import("./pages/Events"));
const ExperimentsPage = lazy(() => import("./pages/ExperimentsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-background text-text-primary flex flex-col">
              <Header />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/aplicar" element={<ApplicationForm />} />
                  <Route path="/links" element={<SocialNetworks />} />
                  <Route path="/status" element={<ApplicationStatus />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/contributors" element={<Contributors />} />
                  <Route path="/token" element={<Token />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/snapshot" element={<Snapshot />} />
                  <Route path="/wheel" element={<UvdWheel />} />
                  <Route path="/twitch-callback" element={<TwitchCallback />} />
                  <Route path="/safestats" element={<SafeStats />} />
                  <Route path="/metrics" element={<MetricsDashboard />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/nfts" element={<NFTPage />} />
                  <Route path="/stream-summaries" element={<StreamSummaries />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/experiments" element={<ExperimentsPage />} />
                </Routes>
              </Suspense>
              {/* <Footer /> */}
            </div>
          </Router>
        </ThirdwebProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;