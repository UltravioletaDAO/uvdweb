import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AppRoutes } from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import WebMCPProvider from "./components/WebMCPProvider";
import { WalletProvider } from "./contexts/WalletContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
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
          <WalletProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <WebMCPProvider />
            <div className="min-h-screen bg-background text-text-primary flex flex-col">
              <Header />
              <AppRoutes />
              <Footer />
            </div>
          </Router>
          </WalletProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;