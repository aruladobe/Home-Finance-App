import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import IncomePage from './pages/Income';
import ExpensesPage from './pages/Expenses';
import InvestmentPage from './pages/Investment';
import ProfitPage from './pages/Profit';
import UserManagement from './pages/UserManagement';
import CalculatorPage from './pages/Calculator';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <FinanceProvider>
              <Layout />
            </FinanceProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/investments" element={<InvestmentPage />} />
        <Route path="/profit" element={<ProfitPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Route>
    </Routes>
  );
}
