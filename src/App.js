import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import ApplicationForm from "./pages/ApplicationForm";
import SocialNetworks from "./pages/SocialNetworks";
import ApplicationStatus from "./pages/ApplicationStatus";
import HamburgerMenu from "./components/HamburgerMenu";
import Purge from "./pages/Purge";
import Courses from "./pages/Courses";
import Token from "./pages/Token";
import Blog from "./pages/BlogList"
import BlogPost from "./pages/BlogPost"
import NotFound from "./pages/NotFound"
import Snapshot from "./pages/Snapshot";
import UvdWheel from "./pages/UvdWheelPage";
import TwitchCallback from './pages/TwitchCallback';
//import Delegations from "./pages/Delegations";
import SafeStats from "./pages/SafeStats";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import MetricsDashboard from "./pages/MetricsDashboard";

const queryClient = new QueryClient();



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <Router>
          <div className="min-h-screen bg-background text-text-primary">
            <HamburgerMenu />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/aplicar" element={<ApplicationForm />} />
              <Route path="/links" element={<SocialNetworks />} />
              <Route path="/status" element={<ApplicationStatus />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/purge" element={<Purge />} />
              <Route path="/token" element={<Token />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/snapshot" element={<Snapshot />} />
              <Route path="/wheel" element={<UvdWheel />} />
              <Route path="/twitch-callback" element={<TwitchCallback />} />
              <Route path="/safestats" element={<SafeStats />} />
              <Route path="/metrics" element={<MetricsDashboard />} />
            </Routes>
          </div>
        </Router>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}

export default App;
