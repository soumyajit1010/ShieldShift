import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

// Feature components
import Layout from './components/common/Layout';
import Landing from './components/public/Landing';
import Login from './components/auth/Login';
import VerifyOTP from './components/auth/VerifyOTP';
import WorkerSetup from './components/onboarding/WorkerSetup';
import Home from './components/dashboard/Home';
import PlanSelection from './components/policy/PlanSelection';
import ClaimTracker from './components/claims/ClaimTracker';
import Signup from './components/auth/Signup';
import Profile from './components/profile/Profile';
import FileClaim from "./components/claims/FileClaim";

/* const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}; */

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  console.log("AUTH:", isAuthenticated);

  if (!isAuthenticated)
    return <Navigate to="/" replace />;

  return children;
};

// Auto-navigate authenticated users away from public routes
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1C1C28',
            color: '#fff',
            border: '1px solid #2E2F3E',
          },
        }} 
      />
      
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        
        <Route path="/onboarding" element={<WorkerSetup />} />        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/plans" element={<PlanSelection />} />
          <Route path="/claims" element={<ClaimTracker />} />
          <Route path="/file-claim" element={<FileClaim />}/>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
