import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatDrawer from './components/ChatDrawer';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Login from './pages/Login';
import LoginWithOTP from './pages/LoginWithOTP';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import VerifyOTP from './pages/VerifyOTP';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import VerifyLoginOTP from './pages/VerifyLoginOTP';
import JobDescription from './pages/JobDescription';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Assesstment from './pages/Assesstment';
import Profile from './pages/Profile';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Apply from './pages/Apply';
import Settings from './pages/Settings';
import CompanyProfile from './pages/CompanyProfile';
import PostJob from './pages/PostJob';
import Pricing from './pages/Pricing';
import VideoInterview from './pages/VideoInterview';
import InfoPage from './pages/InfoPage';
import NotFound from './pages/NotFound';


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navbar />
        <main className="overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-otp" element={<LoginWithOTP />} />
            <Route path="/login-otp/verify" element={<VerifyLoginOTP />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/VerifyOTP" element={<VerifyOTP />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/interview/:roomId" element={<VideoInterview />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
            <Route path="/jobs/:id" element={<JobDescription />} />
            <Route path="/apply/:id" element={<Apply />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/assessments" element={<Assesstment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/blog" element={<InfoPage pageKey="blog" />} />
            <Route path="/help" element={<InfoPage pageKey="help" />} />
            <Route path="/guidelines" element={<InfoPage pageKey="guidelines" />} />
            <Route path="/privacy" element={<InfoPage pageKey="privacy" />} />
            <Route path="/terms" element={<InfoPage pageKey="terms" />} />
            <Route path="/cookies" element={<InfoPage pageKey="cookies" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ChatDrawer />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
