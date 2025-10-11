import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ReportsPage from './pages/ReportsPage';
import AuthSystem from './components/common/AuthSystem';
import SuccessModal from './components/common/SuccessModal';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>

      {/* Modals - these will be conditionally rendered by context */}
      <AuthSystem />
      <SuccessModal />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
};

export default App;