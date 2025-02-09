import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApplicationForm from './pages/ApplicationForm';
import SocialNetworks from './pages/SocialNetworks';
import ApplicationStatus from './pages/ApplicationStatus';
import HamburgerMenu from './components/HamburgerMenu';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text-primary">
        <HamburgerMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aplicar" element={<ApplicationForm />} />
          {/* Comentamos temporalmente la ruta de links */}
          {/* <Route path="/links" element={<SocialNetworks />} /> */}
          <Route path="/status" element={<ApplicationStatus />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;