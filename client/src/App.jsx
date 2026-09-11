import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResearchProvider } from "./context/ResearchContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ResearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ResearchProvider>
    </AuthProvider>
  );
}
