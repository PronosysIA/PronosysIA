import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "./src/i18n/useLang.jsx";
import LandingPage from "./src/pages/LandingPage.jsx";
import Login from "./src/pages/Login.jsx";
import Register from "./src/pages/Register.jsx";
import Dashboard from "./src/pages/Dashboard.jsx";
import AnalyzePubs from "./src/pages/AnalyzePubs.jsx";
import AnalyzeReseaux from "./src/pages/AnalyzeReseaux.jsx";
import Subscription from "./src/pages/Subscription.jsx";
import Admin from "./src/pages/Admin.jsx";
import Generator from "./src/pages/Generator.jsx";
import Booster from "./src/pages/Booster.jsx";
import AnalysesHistory from "./src/pages/AnalysesHistory.jsx";
import GenerationsHistory from "./src/pages/GenerationsHistory.jsx";
import ChatbotPage from "./src/pages/ChatbotPage.jsx";
import ChatHistory from "./src/pages/ChatHistory.jsx";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
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
