import { ErrorBoundary } from "react-error-boundary";
import HomePage from "./pages/home";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/login";
import { Notification } from "./components/notification";

function App() {
  return (
    <ErrorBoundary FallbackComponent={HomePage}>
      <Notification />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage stateLogin={true} />} />
        <Route path="/register" element={<LoginPage stateLogin={false} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
