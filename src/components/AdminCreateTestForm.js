import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import './AdminCreateTestForm.css';

const AdminCreateTestForm = ({ onSignOut }) => {
  const navigate = useNavigate();
  const [testName, setTestName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMins, setDurationMins] = useState(20);
  const [isPublished, setIsPublished] = useState(true);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subtopicSearch, setSubtopicSearch] = useState('');

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  const topics = ['Quantitative Aptitude', 'Reasoning', 'Computer', 'English'];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchSubtopics();
    }
  }, [selectedTopic]);

  const checkAdminAccess = async () => {
    try {
      await getCurrentUser();
      const { tokens } = await fetchAuthSession();
      const groups = tokens?.idToken?.payload?.['cognito:groups'] || [];
      
      if (!groups.includes('admin')) {
        navigate('/home');
      }
    } catch (err) {
      navigate('/home');
    }
  };

  const fetchSubtopics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subtopics?topic=${encodeURIComponent(selectedTopic)}`);
      if (!response.ok) throw new Error('Failed to fetch subtopics');
      const data = await response.json();
      setSubtopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subtopics:', err);
    }
  };

  const handleSubtopicToggle = (subtopic) => {
    setSelectedSubtopics(prev =>
      prev.includes(subtopic) ? prev.filter(s => s !== subtopic) : [...prev, subtopic]
    );
  };

  const filteredSubtopics = subtopics.filter(subtopic =>
    subtopic.toLowerCase().includes(subtopicSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const testData = {
        testName: testName || `${selectedTopic} - ${selectedSubtopics.join(', ')}`,
        topics: [selectedTopic],
        subtopics: selectedSubtopics,
        questionCount: parseInt(questionCount),
        durationMins: parseInt(durationMins),
        isPublished
      };

      console.log('Creating test with data:', testData);
      console.log('Has ID token:', !!idToken);

      const response = await fetch(`${API_BASE_URL}/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken || ''
        },
        body: JSON.stringify(testData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create test');
      }

      const result = await response.json();
      console.log('Test created:', result);
      alert(`Test created successfully! Test ID: ${result.testId}`);
      navigate('/admin');
    } catch (err) {
      console.error('Error creating test:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-test">
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
            <h2>Create New Test</h2>
            <p>Configure and publish a test for aspirants</p>
          </div>
        </header>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="create-test-form">
            {error && <div className="error-alert">{error}</div>}

            <div className="form-group">
              <label>Test Name (Optional)</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Leave blank for auto-generated name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Topic *</label>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setSelectedSubtopics([]);
                }}
                required
                className="form-input"
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {selectedTopic && subtopics.length > 0 && (
              <div className="form-group">
                <label>Subtopics * ({selectedSubtopics.length} selected)</label>
                <div className="subtopics-container">
                  <input
                    type="text"
                    value={subtopicSearch}
                    onChange={(e) => setSubtopicSearch(e.target.value)}
                    placeholder="Search subtopics..."
                    className="subtopics-search"
                  />
                  <div className="subtopics-grid-wrapper">
                    <div className="subtopics-grid">
                      {filteredSubtopics.length > 0 ? (
                        filteredSubtopics.map(subtopic => (
                          <label key={subtopic} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedSubtopics.includes(subtopic)}
                              onChange={() => handleSubtopicToggle(subtopic)}
                            />
                            <span>{subtopic}</span>
                          </label>
                        ))
                      ) : (
                        <p className="subtopics-count">No subtopics found matching "{subtopicSearch}"</p>
                      )}
                    </div>
                  </div>
                  {filteredSubtopics.length > 0 && (
                    <p className="subtopics-count">
                      Showing {filteredSubtopics.length} of {subtopics.length} subtopics
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Number of Questions *</label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  min="1"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  min="1"
                  max="180"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span>Publish immediately (visible to aspirants)</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !selectedTopic || selectedSubtopics.length === 0}
              >
                {loading ? 'Creating...' : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminCreateTestForm;
