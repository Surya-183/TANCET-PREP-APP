import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import './AdminResultsView.css';

const AdminResultsView = ({ onSignOut }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      fetchResults();
    } catch (err) {
      navigate('/home');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch(`${API_BASE_URL}/admin/results?testId=${testId}`, {
        headers: {
          'Authorization': idToken || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResultsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-results-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-results-view">
        <div className="error-container">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <Link to="/admin" className="btn-back">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { testName, summary, results } = resultsData || {};

  return (
    <div className="admin-results-view">
      <aside className="admin-sidebar">
        <header className="sidebar-header">
          <h1>TANCET Admin</h1>
        </header>
        <nav className="sidebar-nav">
          <Link to="/admin">
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
            <h2>{testName || 'Test Results'}</h2>
            <p>Aggregated performance metrics</p>
          </div>
          <Link to="/admin" className="btn-back-header">Back to Dashboard</Link>
        </header>

        <div className="results-body">
          {summary && (
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Attempts</h3>
                <div className="summary-value">{summary.totalAttempts || 0}</div>
              </div>
              <div className="summary-card">
                <h3>Average Score</h3>
                <div className="summary-value">{summary.avgScore?.toFixed(1) || 0}%</div>
              </div>
              <div className="summary-card">
                <h3>Median Score</h3>
                <div className="summary-value">{summary.medianScore || 0}%</div>
              </div>
            </div>
          )}

          {results && results.length > 0 ? (
            <div className="results-table-container">
              <h3>Individual Results</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Score</th>
                    <th>Correct Answers</th>
                    <th>Time Spent</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.userEmail || 'N/A'}</td>
                      <td><span className="score-badge">{result.score || 0}%</span></td>
                      <td>{result.correctAnswers || 0}</td>
                      <td>{Math.floor((result.timeSpent || 0) / 60)}m {(result.timeSpent || 0) % 60}s</td>
                      <td>{result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Link to={`/results/${result.resultId}`} className="view-details-btn">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Results Yet</h3>
              <p>No aspirants have taken this test yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminResultsView;
