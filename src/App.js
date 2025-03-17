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
import Snapshot from "./pages/Snapshot";
import UvdWheel from "./pages/UvdWheelPage";
import TwitchCallback from './pages/TwitchCallback';

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
          <Route path="/snapshot" element={<Snapshot />} />
          <Route path="/wheel" element={<UvdWheel />} />
          <Route path="/twitch-callback" element={<TwitchCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
