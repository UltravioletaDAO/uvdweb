// Tabla de rutas del sitio, en su propio modulo.
//
// Vivia dentro de App.js, que ademas monta los providers (thirdweb, wallet,
// react-query). Eso hacia que un test del routing tuviera que arrastrar toda esa
// cadena para preguntar algo tan chico como "que sirve /terms". Aca la tabla se
// monta sola: lo unico que entra son react-router, el ErrorBoundary y las paginas
// lazy, y solo se carga el chunk de la ruta que se pide.
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

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
const NFTPage = lazy(() => import("./pages/NFTPage"));
const StreamSummaries = lazy(() => import("./pages/StreamSummaries"));
const Events = lazy(() => import("./pages/Events"));
const ExperimentsPage = lazy(() => import("./pages/ExperimentsPage"));
const FacilitatorPage = lazy(() => import("./pages/FacilitatorPage"));
const Bounties = lazy(() => import("./pages/Bounties"));
const Ecosystem = lazy(() => import("./pages/Ecosystem"));
const Purge = lazy(() => import("./pages/Purge"));
const KarmaHelloLanding = lazy(() => import("./pages/KarmaHelloLanding"));
const Delegations = lazy(() => import("./pages/Delegations"));
const Terms = lazy(() => import("./pages/Terms"));

// Route content wrapped in an ErrorBoundary keyed by pathname, so a crash on
// one page is contained to that page instead of cascading across the whole app.
// Se exporta para que los tests puedan ejercer ESTA tabla de rutas --con su
// catch-all-- en vez de montar una pagina suelta y dar por hecho el routing.
export function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
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
          {/* Productos y Servicios absorbido por Ecosystem (seccion #productos); el 301 real vive en amplify.tf */}
          <Route path="/services" element={<Navigate to="/ecosystem#productos" replace />} />
          <Route path="/nfts" element={<NFTPage />} />
          <Route path="/stream-summaries" element={<StreamSummaries />} />
          <Route path="/events" element={<Events />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/facilitator" element={<FacilitatorPage />} />
          {process.env.REACT_APP_BOUNTIES_ENABLED === 'true' && (
            <Route path="/bounties" element={<Bounties />} />
          )}
          <Route path="/ecosystem" element={<Ecosystem />} />
          {/* Agents hub absorbido por Ecosystem (sección #agentes); el 301 real vive en amplify.tf */}
          <Route path="/agents" element={<Navigate to="/ecosystem#agentes" replace />} />
          <Route path="/agent-discovery" element={<Navigate to="/ecosystem#agentes" replace />} />
          <Route path="/purge" element={<Purge />} />
          <Route path="/karma-hello" element={<KarmaHelloLanding />} />
          <Route path="/delegations" element={<Delegations />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
