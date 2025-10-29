import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import './AdminDashboard.css';

const AdminDashboard = ({ onSignOut }) => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      await getCurrentUser();
      const { tokens } = await fetchAuthSession();
      const groups = tokens?.idToken?.payload?.['cognito:groups'] || [];
      
      if (!groups.includes('admin')) {
        navigate('/home');
        return;
      }
      setIsAdmin(true);
      fetchTests();
    } catch (err) {
      console.error('Error checking admin access:', err);
      navigate('/home');
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      console.log('Fetching tests from:', `${API_BASE_URL}/tests`);
      const response = await fetch(`${API_BASE_URL}/tests`);
      console.log('Tests response status:', response.status);
      
      if (!response.ok) throw new Error('Failed to fetch tests');
      
      const data = await response.json();
      console.log('Tests data received:', data);
      console.log('Number of tests:', Array.isArray(data) ? data.length : 0);
      
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <header className="sidebar-header">
          <h1>TANCET Admin</h1>
        </header>
        <nav className="sidebar-nav">
          <Link to="/admin" className="active">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            Dashboard
          </Link>
        </nav>
        <footer className="sidebar-footer">
          <Link to="/home" className="back-home-link">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
          <button className="logout-btn-sidebar" onClick={onSignOut}>
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </footer>
      </aside>

      <main className="admin-main-content">
        <header className="admin-main-header">
          <div>
            <h2>Test Management</h2>
            <p>Create and manage tests for aspirants</p>
          </div>
          <button className="create-test-btn" onClick={() => navigate('/admin/create')}>
            + Create New Test
          </button>
        </header>

        <div className="admin-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : tests.length === 0 ? (
            <div className="empty-state">
              <h3>No Tests Created Yet</h3>
              <p>Create your first test to get started</p>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map((test) => (
                <div key={test.testId} className="test-card">
                  <div className="test-card-header">
                    <h3>{test.testName || 'Untitled Test'}</h3>
                    <span className={`status-badge ${test.isPublished === 'true' ? 'published' : 'draft'}`}>
                      {test.isPublished === 'true' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="test-card-body">
                    <p><strong>Questions:</strong> {test.questionCount || 0}</p>
                    <p><strong>Duration:</strong> {test.durationMins || 0} mins</p>
                    <p><strong>Topics:</strong> {Array.isArray(test.topics) ? test.topics.join(', ') : 'N/A'}</p>
                    <p className="test-meta">Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="test-card-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/admin/results/${test.testId}`)}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
