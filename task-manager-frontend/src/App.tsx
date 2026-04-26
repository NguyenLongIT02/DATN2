import { BrowserRouter } from "react-router-dom";
import { Component, ErrorInfo, ReactNode } from "react";
import AppContextProvider from "@crema/context/AppContextProvider";
import AppThemeProvider from "@crema/context/AppThemeProvider";
import AppLocaleProvider from "@crema/context/AppLocaleProvider";
import AppAuthProvider from "@crema/core/AppAuthProvider";
import AuthRoutes from "@crema/components/AuthRoutes";
import AppLayout from "@crema/core/AppLayout";
import NotificationContextProvider from "./modules/apps/context/NotificationContextProvider";
import "@crema/mockapi";
import { GlobalStyles } from "@crema/core/theme/GlobalStyle";
import { Normalize } from "styled-normalize";
import { useThemeContext } from "@crema/context/AppContextProvider/ThemeContextProvider";
import "./styles/index.css";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { theme } = useThemeContext();

  return (
    <ErrorBoundary>
      <AppContextProvider>
        <AppThemeProvider>
          <AppLocaleProvider>
            <BrowserRouter>
              <AppAuthProvider>
                <AuthRoutes>
                  <NotificationContextProvider>
                    <GlobalStyles theme={theme} />
                    <Normalize />
                    <AppLayout />
                  </NotificationContextProvider>
                </AuthRoutes>
              </AppAuthProvider>
            </BrowserRouter>
          </AppLocaleProvider>
        </AppThemeProvider>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;
