import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchTransitionProvider } from "./contexts/SearchTransitionContext";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchTransitionProvider>
          <BrowserRouter>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </BrowserRouter>
        </SearchTransitionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
