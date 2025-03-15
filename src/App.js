import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text-primary">
        <HamburgerMenu />
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
