import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@src/components/common/Layout";
import HomePage from "@src/pages/HomePage";
import SettingsPage from "@src/pages/SettingsPage";
import LoginPage from "@src/pages/LoginPage";
import RegisterPage from "@src/pages/RegisterPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
