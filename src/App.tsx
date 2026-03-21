import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GrievanceProvider } from './contexts/GrievanceContext';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import FileGrievancePage from './pages/FileGrievancePage';
import TrackGrievancePage from './pages/TrackGrievancePage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import DevelopersPage from './pages/DevelopersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GrievanceProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/file-grievance" element={<FileGrievancePage />} />
                <Route path="/track-grievance" element={<TrackGrievancePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/developers" element={<DevelopersPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                
                {/* Add a catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          
          {/* Toast notification container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                  color: '#fff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              }
            }}
          />
        </Router>
      </GrievanceProvider>
    </AuthProvider>
  );
};

export default App;