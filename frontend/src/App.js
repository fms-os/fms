import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "sonner";

import PublicLayout from "./components/public/PublicLayout";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Projects from "./pages/public/Projects";
import Artists from "./pages/public/Artists";
import Studio from "./pages/public/Studio";
import News from "./pages/public/News";
import Contact from "./pages/public/Contact";
import Booking from "./pages/public/Booking";
import StartProject from "./pages/public/StartProject";

import OSLogin from "./pages/os/Login";
import OSLayout from "./components/os/OSLayout";
import CommandCenter from "./pages/os/CommandCenter";
import OSProjects from "./pages/os/Projects";
import OSArtists from "./pages/os/Artists";
import OSClients from "./pages/os/Clients";
import OSBookings from "./pages/os/Bookings";
import OSAr from "./pages/os/AR";
import OSLeads from "./pages/os/Leads";
import OSIntegrations from "./pages/os/Integrations";
import OSSettings from "./pages/os/Settings";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm text-neutral-500">Chargement…</div>;
  if (!user) return <Navigate to="/os/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* PUBLIC WEBSITE */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/start-project" element={<StartProject />} />
          </Route>

          {/* FMS OS */}
          <Route path="/os/login" element={<OSLogin />} />
          <Route path="/os" element={<Protected><OSLayout /></Protected>}>
            <Route index element={<CommandCenter />} />
            <Route path="projects" element={<OSProjects />} />
            <Route path="artists" element={<OSArtists />} />
            <Route path="clients" element={<OSClients />} />
            <Route path="bookings" element={<OSBookings />} />
            <Route path="ar" element={<OSAr />} />
            <Route path="leads" element={<OSLeads />} />
            <Route path="integrations" element={<OSIntegrations />} />
            <Route path="settings" element={<OSSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
