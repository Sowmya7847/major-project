import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DataSecurity from './pages/DataSecurity';
import EncryptionControl from './pages/EncryptionControl';
import Monitoring from './pages/Monitoring';
import Landing from './pages/Landing';
import AccessPolicies from './pages/AccessPolicies';
import SystemConfig from './pages/SystemConfig';
import Nodes from './pages/Nodes';
import Chatbot from './components/Chatbot';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center text-white">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes with Main Layout */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/data-security"
              element={
                <PrivateRoute>
                  <Layout>
                    <DataSecurity />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/encryption-control"
              element={
                <PrivateRoute>
                  <Layout>
                    <EncryptionControl />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/monitoring"
              element={
                <PrivateRoute>
                  <Layout>
                    <Monitoring />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/nodes"
              element={
                <PrivateRoute>
                  <Layout>
                    <Nodes />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/access-policies"
              element={
                <PrivateRoute>
                  <Layout>
                    <AccessPolicies />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/system-config"
              element={
                <PrivateRoute adminOnly={true}>
                  <Layout>
                    <SystemConfig />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Chatbot />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
