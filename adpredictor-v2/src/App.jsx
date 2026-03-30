import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "./i18n/useLang.jsx";
import NotificationBanner from "./components/NotificationBanner.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AnalyzePubs from "./pages/AnalyzePubs.jsx";
import AnalyzeReseaux from "./pages/AnalyzeReseaux.jsx";
import Subscription from "./pages/Subscription.jsx";
import Admin from "./pages/Admin.jsx";
import Generator from "./pages/Generator.jsx";
import Booster from "./pages/Booster.jsx";
import AnalysesHistory from "./pages/AnalysesHistory.jsx";
import GenerationsHistory from "./pages/GenerationsHistory.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import ChatHistory from "./pages/ChatHistory.jsx";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <NotificationBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/pubs" element={<AnalyzePubs />} />
          <Route path="/dashboard/reseaux" element={<AnalyzeReseaux />} />
          <Route path="/dashboard/subscription" element={<Subscription />} />
          <Route path="/dashboard/admin" element={<Admin />} />
          <Route path="/dashboard/generator" element={<Generator />} />
          <Route path="/dashboard/booster" element={<Booster />} />
          <Route path="/dashboard/analyses" element={<AnalysesHistory />} />
          <Route path="/dashboard/generations" element={<GenerationsHistory />} />
          <Route path="/dashboard/chatbot" element={<ChatbotPage />} />
          <Route path="/dashboard/chat-history" element={<ChatHistory />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;